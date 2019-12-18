import uuid from 'uuid/v4';
import { JobApplication } from '../../models/job_application';

export const getAllApplications = (req, res) => {
  JobApplication.findAll({})
    .then(data => res.send({ text: { data }) })
    .catch(err => {
      console.error(err.stack);
      res.status(500);
    });
};

export const getJobApplicationsByUser = (req, res) => {
  const { user_id } = req.params;

  JobApplication.findAll({ where: { user_id } })
    .then(data => res.send({ text: { data }) })
    .catch(err => {
      console.error(err.stack);
      res.status(500);
    });
};

export const getApplication = (req, res) => {
  const { id } = req.params;
  JobApplication.findAll({}, {
    where: { id },
  })
    .then(data => res.send({ text: { data }) })
    .catch(err => {
      console.error(err.stack);
      res.status(500);
    });
};

export const createApplication = (req, res) => {
  const {
    job_posting_id,
    applicant_id,
  } = req.body;
  JobApplication.create({
    id: uuid(),
    job_posting_id,
    applicant_id,
  })
    .then(() => res.send({
      text: 'Job Application created',
    }))
    .catch(err => {
      console.error(err.stack);
      res.status(500);
    });
};

export const updateApplication = (req, res) => {
  const { id } = req.params;
  const {
    review,
    status,
    offer_details,
    applicant_feedback,
    counsellor_notes,
  } = req.body;
  JobApplication.update({
    review,
    status,
    offer_details,
    applicant_feedback,
    counsellor_notes,
  }, {
    where: { id },
  })
    .then(() => res.send({ text: 'Job application Updated') })
    .catch(err => {
      console.error(err.stack);
      res.status(500);
    });
};

export const deleteApplication = (req, res) => {
  JobApplication.destroy({
    where: { id },
  })
    .then(() => res.send({ text: 'Job application deleted.') })
    .catch(err => {
      console.error(err.stack);
      res.status(500);
    });
};
