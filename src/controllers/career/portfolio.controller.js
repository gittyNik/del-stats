import {
  getPortfoliosByStatus, getPortfoliosByUser, getPortfoliosFromId,
  getAllPortfolios, createPortfolio, updatePortfolioById,
  updatePortfolioForLearner, addPortfolioResume,
} from '../../models/portfolio';

export const getAllPortfoliosAPI = (req, res) => {
  let { limit, page } = req.query;
  let offset;
  if ((limit) && (page)) {
    offset = limit * (page - 1);
  }
  getAllPortfolios(limit, offset)
    .then(data => res.status(201).json({
      message: 'Portfolios fetched',
      data,
      type: 'success',
    }))
    .catch(err => {
      console.error(err.stack);
      res.status(500);
    });
};

export const getPortfoliosByStatusAPI = (req, res) => {
  let { limit, page, status } = req.query;
  let offset;
  if ((limit) && (page)) {
    offset = limit * (page - 1);
  }
  getPortfoliosByStatus(status, limit, offset)
    .then(data => res.status(201).json({
      message: 'Portfolios fetched',
      data,
      type: 'success',
    }))
    .catch(err => {
      console.error(err.stack);
      res.status(500);
    });
};

export const getPortfolioByUser = (req, res) => {
  const { user_id } = req.params;
  const { role } = req.jwtData.user;
  getPortfoliosByUser(user_id, role)
    .then(data => res.status(201).json({
      message: 'Portfolios fetched',
      data,
      type: 'success',
    }))
    .catch(err => {
      console.error(err.stack);
      res.status(500);
    });
};

export const getPortfolioById = (req, res) => {
  const { id } = req.params;
  const { role } = req.jwtData.user;
  getPortfoliosFromId(id, role)
    .then(data => res.status(201).json({
      message: 'Portfolios fetched',
      data,
      type: 'success',
    }))
    .catch(err => {
      console.error(err.stack);
      res.status(500);
    });
};

export const addResumeForLearner = (req, res) => {
  const {
    resume_path,
    learner_id,
  } = req.body;
  const user_name = req.jwtData.user.name;
  const user_id = req.jwtData.user.id;
  let updated_by = {
    user_name,
    updated_at: new Date(),
    user_id,
  };
  addPortfolioResume(learner_id, resume_path, updated_by)
    .then(data => res.status(201).json({
      message: 'Portfolios fetched',
      data,
      type: 'success',
    }))
    .catch(err => {
      console.error(err.stack);
      res.status(500);
    });
};

export const createPortfolioAPI = (req, res) => {
  const {
    showcase_projects,
    fields_of_interest,
    city_of_choices,
    educational_background,
    experience_level,
    relevant_experience_level,
    skill_experience_level,
    resume,
    review,
    reviewed_by,
    status,
    hiring_status,
    work_experience,
    capstone_project,
    tags,
  } = req.body;
  const user_name = req.jwtData.user.name;
  const learner_id = req.jwtData.user.id;
  let updated_by = [{
    user_name,
    updated_at: new Date(),
    user_id: learner_id,
  }];
  createPortfolio(
    learner_id,
    showcase_projects,
    fields_of_interest,
    city_of_choices,
    educational_background,
    experience_level,
    relevant_experience_level,
    skill_experience_level,
    resume,
    review,
    reviewed_by,
    status,
    hiring_status,
    updated_by,
    work_experience,
    capstone_project,
    tags,
  )
    .then((data) => res.status(201).json({
      message: 'Portfolio created',
      data,
      type: 'success',
    }))
    .catch(err => {
      console.error(err.stack);
      res.status(500);
    });
};

export const updatePortfolio = (req, res) => {
  const { id } = req.params;
  const {
    learner_id,
    showcase_projects,
    fields_of_interest,
    city_of_choices,
    educational_background,
    experience_level,
    relevant_experience_level,
    resume,
    review,
    reviewed_by,
    status,
    hiring_status,
    work_experience,
    capstone_project,
    tags,
  } = req.body;
  const user_name = req.jwtData.user.name;
  const user_id = req.jwtData.user.id;
  let updated_by = [{
    user_name,
    updated_at: new Date(),
    user_id,
  }];

  updatePortfolioById(
    id,
    learner_id,
    showcase_projects,
    fields_of_interest,
    city_of_choices,
    educational_background,
    experience_level,
    relevant_experience_level,
    resume,
    review,
    reviewed_by,
    status,
    hiring_status,
    updated_by,
    work_experience,
    capstone_project,
    tags,
  ).then(() => res.status(200).json({
    message: 'Portfolio updated',
    type: 'success',
  }))
    .catch(err => {
      console.error(err.stack);
      res.status(500);
    });
};

export const updatePortfolioLearnerAPI = (req, res) => {
  const {
    showcase_projects,
    fields_of_interest,
    city_of_choices,
    educational_background,
    experience_level,
    relevant_experience_level,
    resume,
    review,
    reviewed_by,
    status,
    hiring_status,
    work_experience,
    capstone_project,
    tags,
  } = req.body;
  const { id: learner_id } = req.params;
  const user_name = req.jwtData.user.name;
  const user_id = req.jwtData.user.id;
  let updated_by = [{
    user_name,
    updated_at: new Date(),
    user_id,
  }];
  updatePortfolioForLearner(
    learner_id,
    showcase_projects,
    fields_of_interest,
    city_of_choices,
    educational_background,
    experience_level,
    relevant_experience_level,
    resume,
    review,
    reviewed_by,
    status,
    hiring_status,
    updated_by,
    work_experience,
    capstone_project,
    tags,
  ).then(() => res.status(200).json({
    message: 'Portfolio updated',
    type: 'success',
  }))
    .catch(err => {
      console.error(err.stack);
      res.status(500);
    });
};
