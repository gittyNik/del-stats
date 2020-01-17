import uuid from 'uuid/v4';
import request from 'superagent';
import Sequelize from 'sequelize';
import { Application, submitApplication } from '../../models/application';
import { Program } from '../../models/program';
import { Cohort } from '../../models/cohort';
import { User } from '../../models/user';
import { getFirewallResourceCount } from '../../models/resource';
import { getFirewallResourceVisitsByUser } from '../../models/resource_visit';
import { Test, getSubmissionTimesByApplication } from '../../models/test';
import { generateTestSeries, populateTestSeries } from './test.controller';
import { sendSms, TEMPLATE_FIREWALL_REJECTED, TEMPLATE_FIREWALL_OFFERED } from '../../util/sms';
import { sendFirewallResult } from '../../integrations/slack/team-app/controllers/firewall.controller';
import { scheduleFirewallRetry } from '../queue.controller';

export const getAllApplications = (req, res) => {
  Application.findAll({
    include: [Cohort, User],
  })
    .then(data => res.status(200).json(data))
    .catch(() => res.sendStatus(500));
};

export const getApplicationById = (req, res) => {
  const { id } = req.params;
  Application.findAll({
    where: { id },
    include: [Cohort, User],
  })
    .then(data => res.status(200).json(data))
    .catch(() => res.sendStatus(500));
};

export const getApplicationsByUserId = (req, res) => {
  const { id } = req.params;
  Application.findAll({
    order: Sequelize.col('created_at'),
    where: { user_id: id },
  })
    .then((data) => {
      if (data.length === 0) { res.sendStatus(404); } else { res.send({ data }); }
    })
    .catch(() => res.sendStatus(500));
};

export const getLatestApplication = (req, res) => {
  const user_id = req.jwtData.user.id;
  Application.findOne({
    order: [[Sequelize.col('created_at'), Sequelize.literal('DESC')]],
    where: { user_id },
  })
    .then((application) => {
      if (application) {
        return populateTestSeries(application).then((data) => {
          res.send({ data });
        });
      }
      return res.sendStatus(404);
    })
    .catch(() => res.sendStatus(500));
};

export const getLiveApplications = (req, res) => {
  Application.findAll({
    where: {
      status: ['applied', 'review_pending', 'offered'],
    },
    include: [Cohort, User],
  })
    .then(data => res.status(200).json(data))
    .catch(() => res.sendStatus(500));
};

export const addApplication = (req, res) => {
  const user_id = req.jwtData.user.id;
  const { cohort_applied } = req.body;

  Cohort.findByPk(cohort_applied).then((cohort) => {
    if (cohort === null) {
      return Promise.reject('cohort not found');
    }
    return Program.findOne({ where: { id: cohort.program_id } });
  })
    .then((program) => { // existence of cohort verified
      if (program === null) {
        return Promise.reject('program not found');
      }
      const testSeriesTemplate = program.test_series;
      const applicationId = uuid();
      return Application.create({
        id: applicationId,
        user_id,
        cohort_applied,
        cohort_joining: cohort_applied,
        status: 'applied',
        created_at: new Date(),
        updated_at: new Date(),
      })
        .then(application => generateTestSeries(testSeriesTemplate, application))
        .then((application) => {
          res.status(201).json(application);
        });
    })
    .catch((err) => {
      console.error(err);
      res.sendStatus(500);
    });
};

// This is redundant, use the instance method from Application model
const populateTestResponses = application => {
  let application_id = application.id;
  return Test.findAll({ where: { application_id }, raw: true })
    .then(test_series => ({ ...application, test_series }));
};

// h.o. function
const notifyApplicationSubmitted = (phone) => (application) => Promise.all([
  sendSms(phone, 'Dear candidate, your application is under review. You will be notified of any updates.')
    .catch(err => console.log(err)),
  populateTestResponses(application)
    .then(appli => sendFirewallResult(appli, phone))
    .catch(err => console.log(err)),
])
  .then(() => application);

export const submitApplicationAndNotify = (id, phone) => submitApplication(id)
  .then(notifyApplicationSubmitted(phone));

// TODO: send all sms using worker. Reduce the delay on web services
export const notifyApplicationReview = (phone, status) => (application) => {
  if(status === 'rejected')
    return sendSms(phone, TEMPLATE_FIREWALL_REJECTED)
      .then(()=> {
        return scheduleFirewallRetry(phone, 'applicant');
      })
      .then(()=>application);
  if(status === 'offered')
    return Cohort.findByPk(application.cohort_joining)
      .then(cohort =>sendSms(phone, TEMPLATE_FIREWALL_OFFERED(cohort, '')))
      .then(()=>application)
  return application;
};

export const updateApplication = (req, res) => {
  const { cohort_joining, status } = req.body;
  const { id } = req.params;
  const { phone } = req.jwtData.user;

  if (cohort_joining && status === 'review_pending') {
    submitApplication(id)
      .then(notifyApplicationSubmitted(phone))
      .then(data => res.status(200).json(data))
      .catch(() => res.sendStatus(500));
  } else if (cohort_joining && !status) {
    Application.update({
      cohort_joining,
    }, { where: { id }, returning: true })
      .then(result => result[1][0])
      .then(data => res.send({data}))
      .catch(() => res.sendStatus(500));
  } else if (status) {
    Application.update({
      status,
    }, { where: { id }, returning: true })
      .then(result => result[1][0])
      .then(notifyApplicationReview(phone, status))
      .then(application => res.send(application))
      .catch((err) => {
        console.log(err);
        res.sendStatus(500);
      });
  } else {
    res.send('please add some data to update');
  }
};

export const deleteApplication = (req, res) => {
  const { id } = req.params;
  Application.update({
    status: 'archieved',
  }, { where: { id } })
    .then(data => res.status(200).json(data))
    .catch(() => res.sendStatus(500));
};

export const payment = (req, res) => {
  let { paymentDetails } = req.body;
  const { id } = req.params;
  const {
    INSTAMOJO_API_KEY, INSTAMOJO_AUTH_TOKEN,
    INSTAMOJO_URL, INSTAMOJO_WEBHOOK, WEBSERVER_REDIRECT_URL,
    INSTAMOJO_SEND_SMS, INSTAMOJO_SEND_EMAIL, INSTAMOJO_ALLOW_RE,
  } = process.env;

  const payload = {
    purpose: id, // passing application id as the Unique identifier.
    amount: paymentDetails.amount,
    phone: paymentDetails.phone,
    buyer_name: paymentDetails.name,
    email: paymentDetails.email,
    redirect_url: WEBSERVER_REDIRECT_URL, // todo
    send_email: INSTAMOJO_SEND_EMAIL,
    webhook: INSTAMOJO_WEBHOOK,
    send_sms: INSTAMOJO_SEND_SMS,
    allow_repeated_payments: INSTAMOJO_ALLOW_RE,
  };
  request
    .post(`${INSTAMOJO_URL}/payment-requests/`)
    .send(payload)
    .set('X-Api-Key', INSTAMOJO_API_KEY)
    .set('X-Auth-Token', INSTAMOJO_AUTH_TOKEN)
    .then((response) => {
      // console.log('Status:', response.status);
      Application.update({
        payment_details: response.body.payment_request,
      }, { where: { id } })
        .then(() => {
          res.status(200).send(response.body.payment_request.longurl);
        })
        // need to redirect to this url.
        // .then(data => res.status(200).send(data.payment_details.longurl);
        .catch(() => res.sendStatus(500));
    })
    .catch(err => {
      if (err.status === 400) {
        console.error('Bad Request: amount field must not be empty');
        res.sendStatus(500);
      } else if (err.status === 401) {
        console.error('Invalid Auth token');
        res.sendStatus(500);
      }
      console.error(err);
    });
};

export const getApplicationStats = (req, res) => {
  const { id } = req.params;
  const user_id = req.jwtData.user.id;

  Promise.all([
    getSubmissionTimesByApplication(id),
    getFirewallResourceVisitsByUser(user_id),
    getFirewallResourceCount(),
  ])
    .then(([submission_times, currentVisits, resourcesCount]) => {
      res.send({
        data: {
          submission_times,
          resource_visits: {
            current: currentVisits,
            total: resourcesCount,
          },
        },
      });
    })
    .catch(err => {
      console.error(err);
      res.sendStatus(500);
    });
};
