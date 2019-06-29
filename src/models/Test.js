import Sequelize from 'sequelize';
import db from '../database';

const Tests = db.define('tests', {
  id: {
    type: Sequelize.UUID,
    defaultValue: Sequelize.UUIDv4,
    primaryKey: true,
  },
  user_id: {
    type: Sequelize.UUID,
    allowNull:false,
  },
  questions: {
    type: Sequelize.ARRAY(Sequelize.JSON),
    allowNull: false,
  },
  gen_time: {
    type: Sequelize.DATE,
    defaultValue: Sequelize.NOW,
    allowNull: true,
  },
  sub_time: {
    type: Sequelize.DATE,
    allowNull: true,
  },
  browser_history: {
    type: Sequelize.ARRAY(Sequelize.STRING),
    allowNull: true,
  },
  createdAt: {
    allowNull: false,
    type: Sequelize.DATE,
    defaultValue: Sequelize.NOW,
  },
  updatedAt: {
    allowNull: false,
    type: Sequelize.DATE,
    defaultValue: Sequelize.NOW,
  },
})

export default Tests;