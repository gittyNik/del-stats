import Sequelize from 'sequelize';
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
});

export const getTopicById = topic_id  => Topic.findByPk(topic_id, {
  attributes: ['milestone_id'],
  raw: true,
});



export default Topic;
