import uuid from 'uuid/v4';
import request from 'superagent';
import Sequelize from 'sequelize';
import {
  Application,
  submitApplication,
  getApplicationStage,
  setApplicationStage,
  offerISA,
  logProcessStatus,
} from '../../models/application';
import { Program } from '../../models/program';
import { Cohort } from '../../models/cohort';
import { User, getProfile } from '../../models/user';
import { getFirewallResourceCount } from '../../models/resource';
import { getFirewallResourceVisitsByUser } from '../../models/resource_visit';
import { Test, getSubmissionTimesByApplication } from '../../models/test';
import { getApplicationDetails } from './agreement_template.controller';
import { generateTestSeries, populateTestSeries } from './test.controller';
import { sendSms, TEMPLATE_FIREWALL_REVIEWED } from '../../util/sms';
import { sendFirewallResult } from '../../integrations/slack/team-app/controllers/firewall.controller';
import { scheduleFirewallRetry } from '../queue.controller';
import { updateDealApplicationStatus } from '../../integrations/hubspot/controllers/deals.controller';
import { PAYMENT_TYPES } from '../../integrations/instamojo/instamojo.controller';
import { checkPaymentStatus } from '../../integrations/instamojo/payment.controller';
import { logger } from '../../util/logger';

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
      status: ['applied', 'review_pending', 'offered', 'rejected'],
    },
    include: [Cohort, User],
    order: [[Sequelize.col('created_at'), Sequelize.literal('DESC')]],
  })
    .then(data => res.status(200).json(data))
    .catch(() => res.sendStatus(500));
};

export const addApplication = (req, res) => {
  const { id: user_id, profile } = req.jwtData.user;
  const { program_id } = req.body;
  updateDealApplicationStatus(profile.hubspotDealId, 'applied')
    .then(() => Program.findOne({ where: { id: program_id } }))
    .then((program) => { // existence of cohort verified
      if (program === null) {
        return Promise.reject('program not found');
      }
      const testSeriesTemplate = program.test_series;
      const applicationId = uuid();
      return Application.create({
        id: applicationId,
        user_id,
        program_id,
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
    .catch(err => console.error(err)),
  populateTestResponses(application)
    .then(appli => sendFirewallResult(appli, phone))
    .catch(err => console.error(err)),
])
  .then(() => application);

export const submitApplicationAndNotify = (id, phone) => submitApplication(id)
  .then(notifyApplicationSubmitted(phone));

// TODO: send all sms using worker. Reduce the delay on web services
export const notifyApplicationReview = (phone, status) => (application) => {
  if (status === 'offered' || status === 'rejected') {
    return User.findByPk(application.user_id)
      .then(user => sendSms(phone, TEMPLATE_FIREWALL_REVIEWED(user.name)))
      .then(() => application);
  }
  return application;
};

export const updateApplication = (req, res) => {
  const {
    cohort_joining, status, phone, profile,
  } = req.body;
  const { id } = req.params;

  if (cohort_joining && status === 'review_pending') {
    updateDealApplicationStatus(profile.hubspotDealId, status)
      .then(() => submitApplication(id))
      .then(notifyApplicationSubmitted(phone))
      .then(data => res.status(200).json(data))
      .catch(() => res.sendStatus(500));
  } else if (cohort_joining && !status) {
    Application.update({
      cohort_joining,
      updated_at: new Date(),
    }, { where: { id }, returning: true })
      .then(result => result[1][0])
      .then(data => res.send({ data }))
      .catch(() => res.sendStatus(500));
  } else if (status) {
    updateDealApplicationStatus(profile.hubspotDealId, status).then(_result => Application.update({
      status,
      updated_at: new Date(),
    }, { where: { id }, returning: true }))
      .then(result => result[1][0])
      .then(notifyApplicationReview(req.body.phone, status))
      .then(application => res.send(application))
      .catch((err) => {
        console.error(err);
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

export const getPaymentAmount = async (req, res) => {
  let { purpose } = req.body;
  // const { id } = req.params;
  const user_id = req.jwtData.user.id;
  let amount;
  let paymentDetails;
  try {
    paymentDetails = await getApplicationDetails(user_id);
    if (PAYMENT_TYPES.pe_first_tranche === purpose) {
      amount = paymentDetails.payment_details.initial_amount;
    }
    if (PAYMENT_TYPES.pe_second_tranche === purpose) {
      amount = paymentDetails.payment_details.amount;
    }
  } catch (err) {
    logger.error(err);
    return res.status(500).json({
      message: 'Failed to fetch amount',
      type: 'failure',
    });
  }
  return res.status(200).json({
    message: `Amount for ${purpose}`,
    data: amount,
    type: 'success',
  });
};

export const payment = async (req, res) => {
  let { purpose, cohort_applied } = req.body;
  const { id } = req.params;
  const user_id = req.jwtData.user.id;
  const {
    INSTAMOJO_API_KEY, INSTAMOJO_AUTH_TOKEN,
    INSTAMOJO_URL, INSTAMOJO_WEBHOOK, INSTAMOJO_URL_REDIRECT,
    INSTAMOJO_SEND_SMS, INSTAMOJO_SEND_EMAIL, INSTAMOJO_ALLOW_RE,
  } = process.env;
  const { name: buyer_name, phone, email } = await getProfile(user_id);
  let amount;
  let paymentDetails;
  try {
    paymentDetails = await getApplicationDetails(user_id);
    if (PAYMENT_TYPES.pe_first_tranche === purpose) {
      amount = paymentDetails.payment_details.initial_amount;
    }
    if (PAYMENT_TYPES.pe_second_tranche === purpose) {
      amount = paymentDetails.payment_details.amount;
    }
  } catch (err) {
    logger.error(err);
    return res.status(500).json({
      message: 'Failed to fetch amount',
      type: 'failure',
    });
  }
  const payload = {
    purpose,
    amount,
    phone,
    buyer_name,
    email,
    redirect_url: INSTAMOJO_URL_REDIRECT, // redirecting url after payment
    send_email: INSTAMOJO_SEND_EMAIL,
    webhook: INSTAMOJO_WEBHOOK,
    send_sms: INSTAMOJO_SEND_SMS,
    allow_repeated_payments: INSTAMOJO_ALLOW_RE,
  };
  const application = await Application
    .findByPk(id)
    .then(_application => _application.get({ plain: true }));

  const { payment_details } = application;
  return request
    .post(`${INSTAMOJO_URL}/payment-requests/`)
    .send(payload)
    .set('X-Api-Key', INSTAMOJO_API_KEY)
    .set('X-Auth-Token', INSTAMOJO_AUTH_TOKEN)
    .then((response) => {
      let pd = { ...payment_details };

      if (PAYMENT_TYPES.pe_first_tranche === purpose) {
        pd.pe_first_tranche = response.body.payment_request;
      }
      if (PAYMENT_TYPES.pe_second_tranche === purpose) {
        pd.pe_second_tranche = response.body.payment_request;
      }

      Application.update({
        cohort_applied,
        payment_details: pd,
      }, { where: { id }, returning: true, plain: true })
        .then(() => {
          // console.log(result[1].dataValues);
          res.status(200).send({
            message: 'Payment Details containing the instamojo redirect url',
            data: response.body.payment_request,
            type: 'success',
          });
        })
        .catch((err) => {
          logger.error(err);
          res.status(500).json({
            message: `Failed to update the payment_details on application_id: ${id}`,
            error: err,
            type: 'failure',
          });
        });
    })
    .catch(err => {
      const { statusCode, text } = err.response;
      if (err.status === 400) {
        logger.error(statusCode, 'Bad Request');
        logger.error(text);
        res.status(statusCode).json({
          message: `${statusCode} : Bad Request`,
          error: JSON.parse(text),
          type: 'success',
        });
      } else if (err.status === 401) {
        logger.error('Invalid Auth token');
        res.status(statusCode).json({
          message: `${statusCode} : Unauthorization`,
          error: JSON.parse(text),
          type: 'failure',
        });
      }
    });
};

export const verifyPayment = async (req, res) => {
  try {
    let payment_id = null; 
    let payment_request_id = null;
    payment_request_id = req.params.payment_request_id;
    if (req.body.payment_id) {
      payment_id = req.body.payment_id;
    }

    let status = await checkPaymentStatus({ payment_id, payment_request_id });
    res.status(200).send({
      message: status,
      type: 'success',
    });
  } catch (err) {
    console.log('%%%%%%%%%%', err);
    res.status(500).send({
      message: err,
      type: 'failure',
    });
  }
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

export const getApplicationStageAPI = (req, res) => {
  const user_id = req.jwtData.user.id;
  getApplicationStage(user_id).then(data => res.status(200).json(data))
    .catch(() => res.sendStatus(500));
};

export const setApplicationStageAPI = (req, res) => {
  const user_id = req.jwtData.user.id;
  const {
    stage, cohort_applied,
    is_isa, is_job_guarantee,
    payment_type, payment_option_selected,
    offered_isa,
  } = req.body;

  setApplicationStage(
    {
      user_id,
      stage,
      cohort_applied,
      is_isa,
      is_job_guarantee,
      payment_type,
      payment_option_selected,
      offered_isa,
    },
  ).then(data => res.status(200).json(data))
    .catch(() => res.sendStatus(500));
};

export const setOfferedISA = (req, res) => {
  const { user_id } = req.params; // user_id
  const { offered_status } = req.body;
  offerISA(user_id, offered_status)
    .then(data => res.status(201).json({
      message: `ISA status: ${offered_status}`,
      data,
      type: 'success',
    }))
    .catch(() => res.sendStatus(500));
};

export const logProcessFailure = (req, res) => {
  const { user_id } = req.params; // user_id
  const { event } = req.body;
  logProcessStatus(user_id, event)
    .then(data => res.status(201).json({
      message: 'Logged Status',
      data,
      type: 'success',
    }))
    .catch(() => res.sendStatus(500));
};
