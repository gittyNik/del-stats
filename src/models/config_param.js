import Sequelize from 'sequelize';
import db from '../database';

const ConfigParam = db.define('config_params', {
  id: {
    type: Sequelize.UUID,
    primaryKey: true,
  },
  key: {
    type: Sequelize.STRING,
    allowNull: false,
    unique: true,
  },
  value: Sequelize.TEXT,
  details: Sequelize.JSON,
  created_at: Sequelize.DATE,
  updated_at: Sequelize.DATE,
});

export default ConfigParam;
