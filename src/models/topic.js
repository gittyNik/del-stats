import Sequelize from 'sequelize';
import uuid from 'uuid';
import db from '../database';

export const BREAKOUT_PATH = [
  'frontend',
  'backend',
  'common',
];

export const Topic = db.define('topics', {
  id: {
    allowNull: false,
    primaryKey: true,
    type: Sequelize.UUID,
  },
  title: {
    type: Sequelize.STRING,
  },
  description: {
    type: Sequelize.TEXT,
  },
  program: {
    type: Sequelize.STRING,
    defaultValue: 'demo',
  },
  milestone_id: {
    type: Sequelize.UUID,
    references: { model: 'milestones' },
  },
  optional: {
    type: Sequelize.BOOLEAN,
    defaultValue: true,
  },
  visible: {
    type: Sequelize.BOOLEAN,
    defaultValue: true,
  },
  domain: Sequelize.ENUM('generic', 'tech', 'mindset', 'dsa'),
  created_at: {
    type: Sequelize.DATE,
  },
  updated_at: {
    type: Sequelize.DATE,
    defaultValue: Sequelize.literal('NOW()'),
  },
  path: {
    type: Sequelize.ENUM(...BREAKOUT_PATH),
    defaultValue: 'common',
  },
});

export const getTopicById = topic_id => Topic.findByPk(topic_id, {
  attributes: ['milestone_id'],
  raw: true,
});

export const getTopicNameById = topic_id => Topic.findByPk(topic_id, {
  attributes: ['title'],
  raw: true,
})
  .then(topic => topic.title);

export const getTopicDataById = topic_id => Topic.findByPk(topic_id, {
  raw: true,
});

export const getTopics = (program) => {
  if (program) {
    return Topic.findAll({
      where: {
        program,
      },
    });
  }
  return Topic.findAll({
  });
};

export const getTopicsByMilestone = (milestone_id, program) => Topic.findAll(
  { where: { milestone_id, program } },
);

export const getTopicIdsByMilestone = (milestone_id, program, path) => Topic.findAll(
  {
    where: { milestone_id, program, path },
    attributes: ['id'],
    raw: true,
  },
);

export const getTopicIdsByPath = (milestone_id, program, path) => Topic.findAll(
  {
    where: { milestone_id, program, path },
    raw: true,
  },
);

export const createTopic = (title, description,
  milestone_id, program, optional, domain,
  path = 'common') => Topic.create(
  {
    id: uuid(),
    title,
    description,
    milestone_id,
    program,
    optional,
    domain,
    path,
    created_at: Date.now(),
  },
);

export const updateATopic = (id, title,
  description,
  program,
  milestone_id,
  optional,
  domain,
  path = 'common') => Topic.update({
  title,
  description,
  program,
  milestone_id,
  optional,
  domain,
  path,
}, { where: { id } });

export const deleteTopic = (id) => Topic.destroy(
  { where: { id } },
);

export default Topic;
