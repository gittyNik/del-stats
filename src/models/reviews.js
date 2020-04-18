import Sequelize from 'sequelize';
import db from '../database';

export const REVIEW_STATUS = ['scheduled', 'in-progress', 'completed', 'review-shared'];

export const Reviews = db.define('reviews', {
  id: {
    type: Sequelize.UUID,
    defaultValue: Sequelize.UUIDV4,
    primaryKey: true,
  },
  created_at: {
    type: Sequelize.DATE,
    defaultValue: Sequelize.literal('NOW()'),
  },
  updated_at: {
    type: Sequelize.DATE,
    defaultValue: Sequelize.literal('NOW()'),
  },
  scheduled_at: {
    type: Sequelize.DATE,
  },
  milestone_team_id: {
    type: Sequelize.UUID,
    references: { model: 'milestone_learner_teams', key: 'id' },
  },
  milestone_name: Sequelize.STRING,
  learner_feedbacks: {
    type: Sequelize.ARRAY(Sequelize.JSON),
    allowNull: true,
  },
  team_feedback: {
    type: Sequelize.JSON,
    allowNull: true,
  },
  zoom_url: Sequelize.STRING,
  call_details: {
    type: Sequelize.JSON,
    allowNull: true,
  },
  additional_details: {
    type: Sequelize.JSON,
    allowNull: true,
  },
  status: {
    type: Sequelize.ENUM(...REVIEW_STATUS),
    allowNull: false,
  },
});

export const getAllReviews = () => Reviews.findAll({});

export const getReviewsById = id => Reviews.findOne(
  { where: { id } },
).then(reviews => reviews);

export const getReviewsByTeam = milestone_team_id => Reviews.findOne(
  { where: { milestone_team_id } },
).then(reviews => reviews);

export const getReviewsByStatus = status => Reviews.findAll(
  {
    where: { status },
    raw: true,
  },
);

export const getReviewsByUserId = user_id => Reviews.findAll(
  {
    where: {
      learner_feedbacks: {
        [Sequelize.Op.contains]: [{ id: user_id }],
      },
    },
    raw: true,
  },
);

export const createReviewEntry = (milestone_team_id, milestone_name,
  status, scheduled_at, call_details, zoom_url) => Reviews.create(
  {
    milestone_team_id,
    milestone_name,
    status,
    scheduled_at,
    call_details,
    zoom_url,
  },
);

export const addReviewsForTeam = (milestone_team_id, learner_feedbacks, status, team_feedback,
  additional_details) => Reviews.update({
  learner_feedbacks,
  team_feedback,
  additional_details,
  status,
}, { where: { milestone_team_id } });

export const updateStatusForTeam = (milestone_team_id, status) => Reviews.update({
  status,
}, { where: { milestone_team_id } });
