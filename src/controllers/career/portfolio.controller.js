import Sequelize from 'sequelize';
import {
  getPortfoliosByStatus,
  getAPortfolio,
  getAllPortfolios, createPortfolio, updatePortfolioById,
  updatePortfolioForLearner, addPortfolioResume, getLearnerList,
} from '../../models/portfolio';
import {
  addShortlistedLearners,
} from '../../models/shortlisted_portfolios';
import { SocialConnection } from '../../models/social_connection';
import {
  addProfilePicture,
} from '../../models/user';
import {
  updateOrCreate,
} from '../../models/index';
import logger from '../../util/logger';

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
      logger.error(err);
      res.status(500);
    });
};

export const getLearnerListAPI = (req, res) => {
  let {
    limit, page, company_id, application,
  } = req.query;
  let offset;
  if ((limit) && (page)) {
    offset = limit * (page - 1);
  }
  return getLearnerList(limit, offset, company_id, application)
    .then(data => res.status(200).json({
      message: 'List of all Available learners',
      data,
      type: 'success',
    }))
    .catch(err => {
      logger.error(err);
      res.status(500).json({
        text: 'Failed to get all learners list',
        type: 'failure',
      });
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
      logger.error(err);
      res.status(500);
    });
};

export const getPortfolioByUser = (req, res) => {
  const { id: learner_id } = req.params;
  const { role } = req.jwtData.user;
  getAPortfolio({ learner_id, role })
    .then(data => res.status(201).json({
      message: 'Portfolios fetched',
      data,
      type: 'success',
    }))
    .catch(err => {
      logger.error(err);
      res.status(500);
    });
};

export const getPortfolioById = (req, res) => {
  const { id } = req.params;
  const { getRubrics } = req.query;
  const { role } = req.jwtData.user;
  getAPortfolio({ id, role, getRubrics })
    .then(data => res.status(201).json({
      message: 'Portfolios fetched',
      data,
      type: 'success',
    }))
    .catch(err => {
      logger.error(err);
      res.status(500);
    });
};

export const addPortfolioToCompany = (req, res) => {
  const {
    portfolio_id,
    company_id,
  } = req.body;
  const user_name = req.jwtData.user.name;
  const user_id = req.jwtData.user.id;
  let updated_by = [{
    user_name,
    updated_at: new Date(),
    user_id,
  }];
  addShortlistedLearners(portfolio_id, company_id, updated_by)
    .then(data => res.status(201).json({
      message: 'Added Portfolio to Company',
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
      logger.error(err);
      res.status(500);
    });
};

export const createPortfolioAPI = async (req, res) => {
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
    learner_id,
    additional_links,
    available_time_slots,
    profile_picture,
    social_connections,
  } = req.body;
  const user_name = req.jwtData.user.name;
  const user_id = req.jwtData.user.id;

  try {
    if ('path' in profile_picture) {
      if (profile_picture.path === '') {
        await addProfilePicture({ user_id, profile_picture: profile_picture.path });
      } else if (profile_picture) {
        await addProfilePicture({ user_id, profile_picture: profile_picture.path });
      }
    }
  } catch (err) {
    console.error(err.stack);
    res.status(500).json({
      text: 'Failed to save or update profile picture',
      type: 'failure',
    });
  }

  try {
    await Promise.all(social_connections.map(async (connection) => {
      connection.created_at = Sequelize.literal('NOW()');
      connection.user_id = learner_id;
      await updateOrCreate(SocialConnection, { provider: connection.provider, user_id: learner_id }, connection);
      return connection;
    }));
  } catch (err1) {
    logger.warn('Error in creating social connections');
  }

  let updated_by = [{
    user_name,
    updated_at: new Date(),
    user_id,
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
    additional_links,
    available_time_slots,
  )
    .then((data) => res.status(201).json({
      message: 'Portfolio created',
      data,
      type: 'success',
    }))
    .catch(err => {
      logger.error(err);
      res.status(500);
    });
};

export const updatePortfolio = async (req, res) => {
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
    additional_links,
    available_time_slots,
    profile_picture,
    social_connections,
  } = req.body;
  const user_name = req.jwtData.user.name;
  const user_id = req.jwtData.user.id;
  let updated_by = [{
    user_name,
    updated_at: new Date(),
    user_id,
  }];

  try {
    if ('path' in profile_picture) {
      if (profile_picture.path === '') {
        await addProfilePicture({ user_id, profile_picture: profile_picture.path });
      } else if (profile_picture) {
        await addProfilePicture({ user_id, profile_picture: profile_picture.path });
      }
    }
  } catch (err) {
    console.error(err.stack);
    res.status(500).json({
      text: 'Failed to save or update profile picture',
      type: 'failure',
    });
  }

  try {
    await Promise.all(social_connections.map(async (connection) => {
      connection.created_at = Sequelize.literal('NOW()');
      connection.user_id = learner_id;
      await updateOrCreate(SocialConnection, { provider: connection.provider, user_id: learner_id }, connection);
      return connection;
    }));
  } catch (err1) {
    logger.warn('Error in creating social connections');
  }

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
    additional_links,
    available_time_slots,
  ).then(() => res.status(200).json({
    message: 'Portfolio updated',
    type: 'success',
  }))
    .catch(err => {
      logger.error(err);
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
    additional_links,
    available_time_slots,
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
    additional_links,
    available_time_slots,
  ).then(() => res.status(200).json({
    message: 'Portfolio updated',
    type: 'success',
  }))
    .catch(err => {
      logger.error(err);
      res.status(500);
    });
};
