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

export default Topic;
