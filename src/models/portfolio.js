import Sequelize from 'sequelize';
import _ from 'lodash';
import uuid from 'uuid/v4';
import db from '../database';
import { USER_ROLES, User } from './user';
import { getViewUrlS3 } from '../controllers/firewall/documents.controller';
import { SocialConnection } from './social_connection';
import { JobApplication } from './job_application';
import { getReviewRubricForALearner } from './learner_breakout';

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
  showcase_projects: Sequelize.ARRAY(Sequelize.JSON),
  fields_of_interest: Sequelize.ARRAY(Sequelize.STRING),
  city_choices: Sequelize.ARRAY(Sequelize.STRING),
  educational_background: Sequelize.ARRAY(Sequelize.JSON),
  work_experience: Sequelize.ARRAY(Sequelize.JSON),
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
  tags: {
    type: Sequelize.ARRAY(Sequelize.UUID),
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
  available_time_slots: Sequelize.ARRAY(Sequelize.JSON),
  updated_by: Sequelize.ARRAY(Sequelize.JSON),
  capstone_project: Sequelize.JSON,
  additional_links: Sequelize.ARRAY(Sequelize.JSON),
});

export const getPortfoliosFromId = (id, role) => Portfolio.findOne({
  where: {
    id,
  },
  include: [{
    model: User,
    attributes: ['name', 'email', 'phone', 'picture', 'status'],
  }],
  raw: true,
})
  .then(async (learnerPortfolio) => {
    let completePortfolio = [];
    if (learnerPortfolio) {
      if (learnerPortfolio.resume) {
        let resume = await getViewUrlS3(learnerPortfolio.resume.path, '', 'resume');
        learnerPortfolio.resume.url = resume.signedRequest;
      }
      let picture = null;
      if (learnerPortfolio['user.picture']) {
        picture = await getViewUrlS3(learnerPortfolio['user.picture'], '', 'profile_picture');
        learnerPortfolio.profile_picture = picture.signedRequest;
      }
      if (learnerPortfolio['user.status'].indexOf('frontend') > -1) {
        learnerPortfolio.path = 'frontend';
      } else {
        learnerPortfolio.path = 'backend';
      }
      const social_connections = await SocialConnection.findAll({
        where: {
          provider: { [Sequelize.Op.in]: ['github', 'linkedin'] },
          user_id: learnerPortfolio.learner_id,
        },
        attributes: ['username', 'provider'],
        raw: true,
      });
      let flatSocial = social_connections.reduce(
        (obj, item) => Object.assign(obj, { [item.provider]: item.username }), {},
      );
      completePortfolio = { ...learnerPortfolio, ...flatSocial };
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
    }
    return completePortfolio;
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

export const getAPortfolio = ({ id, learner_id, role }) => Portfolio.findOne({
  where: (id) ? { id } : { learner_id },
  include: [{
    model: User,
    attributes: ['name', 'email', 'phone', 'picture', 'status'],
  }],
  raw: true,
})
  .then(async (learnerPortfolio) => {
    let completePortfolio = [];
    if (learnerPortfolio) {
      if (learnerPortfolio.resume) {
        let resume = await getViewUrlS3(learnerPortfolio.resume.path, '', 'resume');
        learnerPortfolio.resume.url = resume.signedRequest;
      }
      let picture = null;
      if (learnerPortfolio['user.picture']) {
        picture = await getViewUrlS3(learnerPortfolio['user.picture'], '', 'profile_picture');
        learnerPortfolio.profile_picture = picture.signedRequest;
      }
      if (learnerPortfolio['user.status'].indexOf('frontend') > -1) {
        learnerPortfolio.path = 'frontend';
      } else {
        learnerPortfolio.path = 'backend';
      }
      const social_connections = await SocialConnection.findAll({
        where: {
          provider: { [Sequelize.Op.in]: ['github', 'linkedin'] },
          user_id: learnerPortfolio.learner_id,
        },
        attributes: ['username', 'provider'],
        raw: true,
      });
      let flatSocial = social_connections.reduce(
        (obj, item) => Object.assign(obj, { [item.provider]: item.username }), {},
      );
      completePortfolio = { ...learnerPortfolio, ...flatSocial };
      if ((learnerPortfolio) && (role === RECRUITER)) {
        let profile_views = 1;
        profile_views += learnerPortfolio.profile_views;
        Portfolio.update({
          profile_views,
        }, { where: (id) ? { id } : { learner_id } });
      }
    }
    return completePortfolio;
  })
  .then(async portfolio => {
    portfolio.milestone_rubrics = await getReviewRubricForALearner(portfolio.learner_id);
    return portfolio;
  });

export const createPortfolio = (
  learner_id,
  showcase_projects,
  fields_of_interest,
  city_choices,
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
) => Portfolio.create(
  {
    id: uuid(),
    learner_id,
    showcase_projects,
    fields_of_interest,
    city_choices,
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
    work_experience,
    capstone_project,
    tags,
    additional_links,
    available_time_slots,
  },
);

export const updatePortfolioById = (
  id,
  learner_id,
  showcase_projects,
  fields_of_interest,
  city_choices,
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
) => Portfolio.findOne({
  where: {
    id,
  },
})
  .then((learnerPortfolio) => {
    if (_.isEmpty(learnerPortfolio)) {
      throw Error('Portfolio does not exist!');
    }

    learnerPortfolio.updated_by.push(...updated_by);

    return Portfolio.update({
      learner_id,
      showcase_projects,
      fields_of_interest,
      city_choices,
      educational_background,
      experience_level,
      relevant_experience_level,
      resume,
      review,
      reviewed_by,
      status,
      hiring_status,
      updated_by: learnerPortfolio.updated_by,
      work_experience,
      capstone_project,
      tags,
      additional_links,
      available_time_slots,
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
  city_choices,
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
) => Portfolio.findOne({
  where: {
    learner_id,
  },
})
  .then((learnerPortfolio) => {
    if (_.isEmpty(learnerPortfolio)) {
      throw Error('Portfolio does not exist!');
    }

    learnerPortfolio.updated_by.push(...updated_by);

    return Portfolio.update({
      learner_id,
      showcase_projects,
      fields_of_interest,
      city_choices,
      educational_background,
      experience_level,
      relevant_experience_level,
      resume,
      review,
      reviewed_by,
      status,
      hiring_status,
      updated_by: learnerPortfolio.updated_by,
      work_experience,
      capstone_project,
      tags,
      additional_links,
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

// export const getLearnerList = async (limit = 10, offset = 0) => Portfolio
//   .findAndCountAll({
//     where: {
//       status: 'available',
//     },
//     include: [{
//       model: User,
//       attributes: ['name', 'email', 'phone', 'picture', 'status'],
//       include: [{
//         model: SocialConnection,
//         as: 'SocialDetails',
//         where: {
//           provider: { [Sequelize.Op.in]: ['github', 'linkedin'] },
//         },
//         attributes: ['username', 'provider'],
//       }],
//     }],
//     offset,
//     limit,
//     raw: true,
//   });

export const getLearnerList = async (limit = 10, offset = 0) => {
  const { count, rows: portfolios } = await Portfolio
    .findAndCountAll({
      where: {
        status: 'available',
      },
      include: [{
        model: User,
        attributes: ['name', 'email', 'phone', 'picture', 'status'],
      },
      {
        model: JobApplication,
        attributes: ['job_posting_id', 'status'],
        required: false,
      },
      ],
      offset,
      limit,
      raw: true,
    });
  const learnerList = await Promise.all(portfolios.map(async portfolio => {
    const { learner_id } = portfolio;
    let picture = null;
    if (portfolio['user.picture']) {
      picture = await getViewUrlS3(portfolio['user.picture'], '', 'profile_picture');
      portfolio.profile_picture = picture.signedRequest;
    }
    if (portfolio['user.status'].indexOf('frontend') > -1) {
      portfolio.path = 'frontend';
    } else {
      portfolio.path = 'backend';
    }
    const social_connections = await SocialConnection.findAll({
      where: {
        provider: { [Sequelize.Op.in]: ['github', 'linkedin'] },
        user_id: learner_id,
      },
      attributes: ['username', 'provider'],
      raw: true,
    });
    let flatSocial = social_connections.reduce(
      (obj, item) => Object.assign(obj, { [item.provider]: item.username }), {},
    );
    return { ...portfolio, ...flatSocial };
  }));
  return {
    count,
    learnerList,
  };
};

export default Portfolio;
