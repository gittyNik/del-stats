import Sequelize from 'sequelize';
import _ from 'lodash';
import uuid from 'uuid/v4';
import db from '../database';
import { USER_ROLES } from './user';

const {
  RECRUITER,
} = USER_ROLES;

const HIRING_STATUS = [
  'available', 'currently-unavailable',
  'hired',
];

export const Portfolio = db.define('portfolios', {
  id: {
    type: Sequelize.UUID,
    defaultValue: Sequelize.UUIDV4,
    primaryKey: true,
  },
  learner_id: {
    type: Sequelize.UUID,
    unique: true,
    references: { model: 'users', key: 'id' },
  },
  showcase_projects: Sequelize.ARRAY(Sequelize.STRING),
  fields_of_interest: Sequelize.ARRAY(Sequelize.STRING),
  city_choices: Sequelize.ARRAY(Sequelize.STRING),
  educational_backgroud: Sequelize.STRING,
  experience_level: Sequelize.STRING,
  relevant_experience_level: Sequelize.STRING,
  skill_experience_level: Sequelize.ARRAY(Sequelize.JSON),
  resume: Sequelize.JSON,
  review: Sequelize.TEXT,
  reviewed_by: {
    type: Sequelize.UUID,
    references: { model: 'users', key: 'id' },
  },
  status: Sequelize.STRING,
  hiring_status: {
    type: Sequelize.ENUM(...HIRING_STATUS),
    defaultValue: 'available',
  },
  profile_views: {
    type: Sequelize.INTEGER,
    defaultValue: 0,
  },
  created_at: {
    type: Sequelize.DATE,
  },
  updated_at: {
    type: Sequelize.DATE,
    defaultValue: Sequelize.literal('NOW()'),
  },
  updated_by: Sequelize.ARRAY(Sequelize.JSON),
});

export const getPortfoliosFromId = (id, role) => Portfolio.findOne({
  where: {
    id,
  },
})
  .then((learnerPortfolio) => {
    if ((learnerPortfolio) && (role === RECRUITER)) {
      let profile_views = 1;
      profile_views += learnerPortfolio.profile_views;
      Portfolio.update({
        profile_views,
      }, {
        where: {
          id,
        },
      });
    }
    return learnerPortfolio;
  });

export const getAllPortfolios = (
  limit = 10,
  offset = 0,
) => Portfolio.findAndCountAll(
  {
    offset,
    limit,
  },
);

export const getPortfoliosByStatus = (
  hiring_status,
  limit = 10,
  offset = 0,
) => Portfolio.findAndCountAll(
  {
    where: { hiring_status },
    offset,
    limit,
  },
);

export const getPortfoliosByUser = (learner_id, role) => Portfolio.findOne({
  where: {
    learner_id,
  },
})
  .then((learnerPortfolio) => {
    if ((learnerPortfolio) && (role === RECRUITER)) {
      let profile_views = 0;
      profile_views += learnerPortfolio.profile_views;
      Portfolio.update({
        profile_views,
      }, {
        where: {
          learner_id,
        },
      });
    }
    return learnerPortfolio;
  });

export const createPortfolio = (
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
) => Portfolio.create(
  {
    id: uuid(),
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
    created_at: new Date(),
    updated_by,
  },
);

export const updatePortfolioById = (
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
) => Portfolio.findOne({
  where: {
    id,
  },
})
  .then((learnerPortfolio) => {
    if (_.isEmpty(learnerPortfolio)) {
      return Portfolio.create({
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
        updated_by: [updated_by],
      });
    }

    learnerPortfolio.updated_by.push(...updated_by);

    return Portfolio.update({
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
      updated_by: learnerPortfolio.updated_by,
    }, {
      where: {
        id,
      },
    });
  });

export const updatePortfolioForLearner = (
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
) => Portfolio.findOne({
  where: {
    learner_id,
  },
})
  .then((learnerPortfolio) => {
    if (_.isEmpty(learnerPortfolio)) {
      return Portfolio.create({
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
        updated_by: [updated_by],
      });
    }

    learnerPortfolio.updated_by.push(...updated_by);

    return Portfolio.update({
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
      updated_by: learnerPortfolio.updated_by,
    }, {
      where: {
        learner_id,
      },
    });
  });

export const addPortfolioResume = (
  learner_id,
  resume_path,
  updated_by,
) => Portfolio.findOne({
  where: {
    learner_id,
  },
})
  .then((learnerPortfolio) => {
    learnerPortfolio.updated_by.push(...updated_by);
    let resume = {
      path: resume_path,
      updated_at: new Date(),
    };

    return Portfolio.update({
      learner_id,
      resume,
      updated_by: learnerPortfolio.updated_by,
    }, {
      where: {
        learner_id,
      },
    });
  });

export default Portfolio;
