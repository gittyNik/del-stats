import Sequelize from 'sequelize';
import uuid from 'uuid';
import db from '../database';

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
});

export const getTopicById = topic_id => Topic.findByPk(topic_id, {
  attributes: ['milestone_id'],
  raw: true,
});

export const getTopics = () => Topic.findAll({});


export const getTopicsByMilestone = (milestone_id, program) => Topic.findAll(
  { where: { milestone_id, program } },
);

export const createTopic = (title, description,
  milestone_id, program, optional, domain) => Topic.create(
  {
    id: uuid(),
    title,
    description,
    milestone_id,
    program,
    optional,
    domain,
    created_at: Date.now(),
  },
);

export const updateATopic = (id, title,
  description,
  program,
  milestone_id,
  optional,
  domain) => Topic.update({
  title,
  description,
  program,
  milestone_id,
  optional,
  domain,
}, { where: { id } });


export const deleteTopic = (id) => Topic.destroy(
  { where: { id } },
);


export default Topic;
