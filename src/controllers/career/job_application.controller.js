import uuid from 'uuid/v4';
import {JobApplication} from '../../models/job_application';

export const getAllApplications = (req, res) => {
  JobApplication.findAll({})
    .then(data => res.json(data))
    .catch(err => {
      console.error(err.stack);
      res.status(500);
    });
};

export const getApplication = (req, res) => {
  const { id } = req.params;
  JobApplication.findAll({},{
    where: { id }
  })
    .then(data => res.json(data))
    .catch(err => {
      console.error(err.stack);
      res.status(500);
    });
};

export const createApplication = (req, res) => {
  const {
    job_posting_id,
    applicant_id,
    review,
    status,
    offer_details,
    applicant_feedback,
    counsellor_notes
  } = req.body;
  JobApplication.create({
    id: uuid(),
    job_posting_id,
    applicant_id,
    review,
    status,
    offer_details,
    applicant_feedback,
    counsellor_notes
  })
    .then(() => res.send("Job Application created"))
    .catch(err => {
      console.error(err.stack);
      res.status(500);
    });
};

export const updateApplication = (req, res) => {
  const { id } = req.params;
  const {
    job_posting_id,
    applicant_id,
    review,
    status,
    offer_details,
    applicant_feedback,
    counsellor_notes
  } = req.body;
  JobApplication.update({
    job_posting_id,
    applicant_id,
    review,
    status,
    offer_details,
    applicant_feedback,
    counsellor_notes
  }, {
    where: { id }
  })
    .then(() => res.send("Job Application Updated"))
    .catch(err => {
      console.error(err.stack);
      res.status(500);
    });
};

export const deleteApplication = (req, res) => {
  JobApplication.destroy({
    where: { id }
  })
    .then(() => res.send("Application deleted."))
    .catch(err => {
      console.error(err.stack);
      res.status(500);
    });
};
