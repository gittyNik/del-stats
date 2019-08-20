import Sequelize from 'sequelize';
import db from '../database';

const ResourceReport = db.define('resource_reports', {
  id: {
    type: Sequelize.UUID,
    defaultValue: Sequelize.UUIDV4,
    primaryKey: true,
  },
  resource_id: {
    type: Sequelize.UUID,
    references: { model: 'resources', key: 'id' },
  },
  report: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  status: {
    type: Sequelize.STRING,
    allowNull: false,
    defaultValue: 'pending',
  },
});

export default ResourceReport;
