import uuid from 'uuid/v4';
import Sequelize from 'sequelize';
import Application from '../../models/application';
import Program from '../../models/program';
import Cohort from '../../models/cohort';
import { generateTestSeries, populateTestSeries } from './test.controller';
import { sendSms } from '../../util/sms';

export const getAllApplications = (req, res) => {
  Application.findAll()
    .then(data => res.status(200).json(data))
    .catch(err => res.sendStatus(500));
};

export const getApplicationById = (req, res) => {
  const { id } = req.params;
  Application.findAll({ where: { id } })
    .then(data => res.status(200).json(data))
    .catch(err => res.sendStatus(500));
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
    .catch(err => res.sendStatus(500));
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
      res.sendStatus(404);
    })
    .catch(err => res.sendStatus(500));
};

export const getLiveApplications = (req, res) => {
  Application.findAll({
    where: {
      status: ['applied', 'review_pending', 'offered'],
    },
  })
    .then(data => res.status(200).json(data))
    .catch(err => res.sendStatus(500));
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

export const updateApplication = (req, res) => {
  const { cohort_joining, status } = req.body;
  const { id } = req.params;
  if (cohort_joining && status) {
    Application.update({
      cohort_joining,
      status,
    }, { where: { id } })
      .then(data => res.status(200).json(data))
      .catch(err => res.sendStatus(500));
  } else if (cohort_joining) {
    Application.update({
      cohort_joining,
    }, { where: { id } })
      .then(data => res.status(200).json(data))
      .catch(err => res.sendStatus(500));
  } else if (status) {
    Application.update({
      status,
    }, { where: { id } })
      .then(async (data) => {
        sendSms(req.jwtData.user.phone, 'Dear candidate, your application is under review. You will be notified of any updates.')
          .then(res => console.log(res))
          .catch(err => console.log(err));
        res.status(200).json(data);
      })
      .catch((err) => {
        console.log(err);
        res.sendStatus(500);
      });
  } else {
    res.send('please add some data to update');
  }
};

export const deleteApplication = (req, res) => {
  Application.update({
    status: 'archieved',
  }, { where: { id } })
    .then(data => res.status(200).json(data))
    .catch(err => res.sendStatus(500));
};

export const payment = (req, res) => {
  const { payment_details } = req.body;
  const { id } = req.params;
  const payment = JSON.parse(payment_details);
  Application.update({
    payment_details: payment,
  }, { where: { id } })
    .then(data => res.status(200).json(data))
    .catch(err => res.sendStatus(500));
};