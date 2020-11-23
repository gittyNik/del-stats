import {
  getJobPostingFromId, getAllJobPostings,
  getJobPostingsByStatus, getJobPostingsByCompany,
  createJobPosting, updateJobPostingById,
  removeJobPosting,
} from '../../models/job_postings';

export const getAllJobPostingsAPI = (req, res) => {
  let {
    limit, page, status, company_id,
  } = req.query;
  let offset;
  if ((limit) && (page)) {
    offset = limit * (page - 1);
  }
  getAllJobPostings({
    limit, offset, status, company_id,
  })
    .then(data => res.status(201).json({
      message: 'Job Postings fetched',
      data,
      type: 'success',
    }))
    .catch(err => {
      console.error(err.stack);
      res.sendStatus(500);
    });
};

export const getJobPostingsByStatusAPI = (req, res) => {
  let { limit, page, status } = req.query;
  let offset;
  if ((limit) && (page)) {
    offset = limit * (page - 1);
  }
  getJobPostingsByStatus({ status, limit, offset })
    .then(data => res.status(201).json({
      message: 'Job Postings fetched',
      data,
      type: 'success',
    }))
    .catch(err => {
      console.error(err.stack);
      res.sendStatus(500);
    });
};

export const getJobPostingById = (req, res) => {
  const { id } = req.params;
  const { assignment, job_details } = req.query;
  const { role } = req.jwtData.user;
  getJobPostingFromId(id, role, assignment, job_details)
    .then(data => res.status(201).json({
      message: 'Job Posting fetched',
      data,
      type: 'success',
    }))
    .catch(err => {
      console.error(err.stack);
      res.sendStatus(500);
    });
};

export const getJobPostingsByCompanyAPI = (req, res) => {
  let {
    limit, page, status,
  } = req.query;
  let company_id = req.params.id;
  let offset;
  if ((limit) && (page)) {
    offset = limit * (page - 1);
  }
  getJobPostingsByCompany({
    company_id, status, limit, offset,
  })
    .then(data => res.status(201).json({
      message: 'Job Postings fetched',
      data,
      type: 'success',
    }))
    .catch(err => {
      console.error(err.stack);
      res.sendStatus(500);
    });
};

export const createJobPostingAPI = (req, res) => {
  const {
    company_id,
    description,
    tags,
    status,
    vacancies,
    id_recruiter,
    name_recruiter,
    added_by_recruiter = true,
    default_assignment,
    attached_assignments,
    start_range,
    end_range,
    job_type,
    locations,
    experience_required,
    title,
  } = req.body;
  let user_name = name_recruiter;
  let recruiter_id = id_recruiter;
  if (added_by_recruiter) {
    recruiter_id = req.jwtData.user.id;
    user_name = req.jwtData.user.name;
  }
  let posted_by = [{
    user_name,
    updated_at: new Date(),
    recruiter_id,
  }];
  createJobPosting({

    company_id,
    description,
    tags,
    status,
    posted_by,
    vacancies,
    start_range,
    end_range,
    job_type,
    locations,
    experience_required,
    title,
    default_assignment,
    attached_assignments,
  })
    .then((data) => res.status(201).json({
      message: 'Job Posting created',
      data,
      type: 'success',
    }))
    .catch(err => {
      console.error(err.stack);
      res.sendStatus(500);
    });
};

export const updateJobPostingAPI = (req, res) => {
  const { id } = req.params;
  const {
    company_id,
    description,
    tags,
    status,
    vacancies,
    id_recruiter,
    name_recruiter,
    added_by_recruiter = true,
    start_range,
    end_range,
    job_type,
    locations,
    experience_required,
    title,
    default_assignment,
    attached_assignments,
  } = req.body;
  let user_name = name_recruiter;
  let recruiter_id = id_recruiter;
  if (added_by_recruiter) {
    recruiter_id = req.jwtData.user.id;
    user_name = req.jwtData.user.name;
  }
  let posted_by = [{
    user_name,
    updated_at: new Date(),
    recruiter_id,
  }];

  updateJobPostingById({

    id,
    company_id,
    description,
    tags,
    status,
    posted_by,
    vacancies,
    start_range,
    end_range,
    job_type,
    locations,
    experience_required,
    title,
    default_assignment,
    attached_assignments,
  }).then(() => res.status(200).json({
    message: 'Job Posting updated',
    type: 'success',
  }))
    .catch(err => {
      console.error(err.stack);
      res.sendStatus(500);
    });
};

export const removeJobPostingAPI = (req, res) => {
  const {
    id, name_recruiter, id_recruiter, added_by_recruiter,
  } = req.params;
  let user_name = name_recruiter;
  let recruiter_id = id_recruiter;
  if (added_by_recruiter) {
    recruiter_id = req.jwtData.user.id;
    user_name = req.jwtData.user.name;
  }
  let posted_by = [{
    user_name,
    updated_at: new Date(),
    recruiter_id,
  }];

  removeJobPosting(
    id,
    posted_by,
  ).then(() => res.status(200).json({
    message: 'Job Posting removed',
    type: 'success',
  }))
    .catch(err => {
      console.error(err.stack);
      res.sendStatus(500);
    });
};
