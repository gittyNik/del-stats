import Sequelize from 'sequelize';
import db from '../database';

const Test = db.define('tests', {
  id: {
    type: Sequelize.UUID,
    primaryKey: true,
  },
  application_id: {
    type: Sequelize.UUID,
    allowNull:false,
  },
  questions: {
    type: Sequelize.ARRAY(Sequelize.JSON),
    allowNull: false,
  },
  sub_time: Sequelize.DATE,
  browser_history: Sequelize.ARRAY(Sequelize.UUID),
  createdAt: {
    allowNull: false,
    type: Sequelize.DATE,
  },
  updatedAt: {
    allowNull: false,
    type: Sequelize.DATE,
  },
})
export default Test;
