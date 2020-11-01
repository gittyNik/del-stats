import {
  getAllJobApplications,
  getJobApplicationsByCompany, getJobApplicationsForLearnerId, createJobApplication,
  getJobApplication, updateJobApplication, deleteJobApplication,
} from '../../models/job_application';

export const getAllJobApplicationsAPI = async (req, res) => {
  let {
    limit, page, status,
  } = req.query;
  let offset = limit * page;
  return getAllJobApplications({ status, limit, offset })
    .then(data => res.status(200).json({
      text: 'List of all Job Applications',
      data,
      type: 'success',
    }))
    .catch(err => {
      console.error(err);
      res.sendStatus(500);
    });
};
export const getJobApplicationsByCompanyAPI = (req, res) => {
  let {
    limit, page, status,
  } = req.query;
  const { id: company_id } = req.params;
  let offset = limit * page;
  return getJobApplicationsByCompany({
    company_id, status, limit, offset,
  })
    .then(data => res.status(200).json({
      text: 'List of all Job Applications for a company',
      data,
      type: 'success',
    }))
    .catch(err => {
      console.error(err);
      res.sendStatus(500);
    });
};

export const getJobApplicationsForLearnerIdAPI = (req, res) => {
  let {
    limit, page, status,
  } = req.query;
  const { id: learner_id } = req.params;
  let offset = limit * page;
  return getJobApplicationsForLearnerId({
    learner_id, status, limit, offset,
  })
    .then(data => res.status(200).json({
      text: 'List of all Job Applications for a company',
      data,
      type: 'success',
    }))
    .catch(err => {
      console.error(err);
      res.sendStatus(500);
    });
};

export const getJobApplicationAPI = (req, res) => {
  const { id } = req.params;
  return getJobApplication(id)
    .then(data => res.status(200).json({
      text: 'List of all Job Applications for a company',
      data,
      type: 'success',
    }))
    .catch(err => {
      console.error(err);
      res.sendStatus(500);
    });
};

export const createJobApplicationAPI = (req, res) => {
  const {
    job_posting_id,
    portfolio_id,
    assignment_due_date,
  } = req.body;
  return createJobApplication({
    job_posting_id, portfolio_id, assignment_due_date,
  })
    .then(data => res.status(200).json({
      text: 'Created a Job Application',
      data,
      type: 'success',
    }))
    .catch(err => {
      console.error(err);
      res.sendStatus(500);
    });
};

export const updateJobApplicationAPI = (req, res) => {
  const { id } = req.params;
  const {
    job_posting_id, portfolio_id, review, status,
    assignment_status, offer_status,
    interview_status, assignment_due_date, interview_date,
    offer_details, applicant_feedback, counsellor_notes,
  } = req.body;
  return updateJobApplication({
    id,
    job_posting_id,
    portfolio_id,
    review,
    status,
    assignment_status,
    offer_status,
    interview_status,
    assignment_due_date,
    interview_date,
    offer_details,
    applicant_feedback,
    counsellor_notes,
  })
    .then(data => res.status(200).json({
      text: 'Updated a Job Application',
      data,
      type: 'success',
    }))
    .catch(err => {
      console.error(err);
      res.sendStatus(500);
    });
};

export const deleteJobApplicationAPI = (req, res) => {
  const { id } = req.params;

  return deleteJobApplication(id)
    .then(() => res.status(200).json({
      text: 'Deleted a Job Application',
      // data,
      type: 'success',
    }))
    .catch(err => {
      console.error(err);
      res.sendStatus(500);
    });
};
