import {
  getAllJobApplications,
  getJobApplicationsByCompany, getJobApplicationsForLearnerId, createJobApplication,
  getJobApplication, updateJobApplication, deleteJobApplication,
  createJobApplicationForPortofolio,
} from '../../models/job_application';

export const getAllJobApplicationsAPI = async (req, res) => {
  let {
    limit, page,
  } = req.query;
  let offset;
  if ((limit) && (page)) {
    offset = limit * (page - 1);
  }
  return getAllJobApplications({ limit, offset })
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
  let offset;
  if ((limit) && (page)) {
    offset = limit * (page - 1);
  }
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
  let offset;
  if ((limit) && (page)) {
    offset = limit * (page - 1);
  }
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
      text: 'Application for id',
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
    status,
    attached_assignment,
  } = req.body;
  return createJobApplication({
    job_posting_id,
    portfolio_id,
    assignment_due_date,
    status,
    attached_assignment,
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

export const sendAssignmentAndCreateApplication = (req, res) => {
  const {
    job_posting_id, portfolio_id, learner_id,
    assignment_id, assignment_due_date,
  } = req.body;
  return createJobApplicationForPortofolio({
    job_posting_id,
    portfolio_id,
    learner_id,
    assignment_id,
    assignment_due_date,
  })
    .then(data => res.status(200).json({
      text: 'Sent Assignment and created a Job Application',
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
    assignment_id, learner_id,
  } = req.body;
  const user_name = req.jwtData.user.name;
  const user_id = req.jwtData.user.id;
  let updated_by = {
    user_name,
    updated_at: new Date(),
    user_id,
  };
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
    assignment_id,
    learner_id,
    updated_by,
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
