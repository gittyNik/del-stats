import Sequelize from 'sequelize';
import db from '../database';

const Topic = db.define('topics', {
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
    references: { model: 'milestones', key: 'id' },
  },
});

export default Topic;
