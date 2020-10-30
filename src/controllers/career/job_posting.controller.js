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
  let offset = limit * page;
  getAllJobPostings(limit, offset, status, company_id)
    .then(data => res.status(201).json({
      message: 'Job Postings fetched',
      data,
      type: 'success',
    }))
    .catch(err => {
      console.error(err.stack);
      res.status(500);
    });
};

export const getJobPostingsByStatusAPI = (req, res) => {
  let { limit, page, status } = req.query;
  let offset = limit * page;
  getJobPostingsByStatus(status, limit, offset)
    .then(data => res.status(201).json({
      message: 'Job Postings fetched',
      data,
      type: 'success',
    }))
    .catch(err => {
      console.error(err.stack);
      res.status(500);
    });
};

export const getJobPostingById = (req, res) => {
  const { id } = req.params;
  const { role } = req.jwtData.user;
  getJobPostingFromId(id, role)
    .then(data => res.status(201).json({
      message: 'Job Posting fetched',
      data,
      type: 'success',
    }))
    .catch(err => {
      console.error(err.stack);
      res.status(500);
    });
};

export const getJobPostingsByCompanyAPI = (req, res) => {
  let {
    limit, page, company_id, status,
  } = req.query;
  let offset = limit * page;
  getJobPostingsByCompany(company_id, status, limit, offset)
    .then(data => res.status(201).json({
      message: 'Job Postings fetched',
      data,
      type: 'success',
    }))
    .catch(err => {
      console.error(err.stack);
      res.status(500);
    });
};

export const createJobPostingAPI = (req, res) => {
  const {
    company_id,
    description,
    tags,
    status,
  } = req.body;
  const user_name = req.jwtData.user.name;
  const recruiter_id = req.jwtData.user.id;
  let posted_by = [{
    user_name,
    updated_at: new Date(),
    user_id: recruiter_id,
  }];
  createJobPosting(
    company_id,
    description,
    tags,
    status,
    posted_by,
  )
    .then((data) => res.status(201).json({
      message: 'Job Posting created',
      data,
      type: 'success',
    }))
    .catch(err => {
      console.error(err.stack);
      res.status(500);
    });
};

export const updateJobPostingAPI = (req, res) => {
  const { id } = req.params;
  const {
    company_id,
    description,
    tags,
    status,
  } = req.body;
  const user_name = req.jwtData.user.name;
  const user_id = req.jwtData.user.id;
  let posted_by = [{
    user_name,
    updated_at: new Date(),
    user_id,
  }];

  updateJobPostingById(
    id,
    company_id,
    description,
    tags,
    status,
    posted_by,
  ).then(() => res.status(200).json({
    message: 'Job Posting updated',
    type: 'success',
  }))
    .catch(err => {
      console.error(err.stack);
      res.status(500);
    });
};

export const removeJobPostingAPI = (req, res) => {
  const { id } = req.params;
  const user_name = req.jwtData.user.name;
  const user_id = req.jwtData.user.id;
  let posted_by = [{
    user_name,
    updated_at: new Date(),
    user_id,
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
      res.status(500);
    });
};
