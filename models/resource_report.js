import Sequelize from 'sequelize';
const db =require('../database');

const Resource_Reports = db.define('resource_reports', {
        resource_id: {
          type: Sequelize.UUID,
          references: { model: 'resources', key: 'id' }
        },
        report: {
          type: Sequelize.TEXT,
          allowNull: false,
        },
        status: {
          type: Sequelize.STRING,
          allowNull:false,
          defaultValue: 'pending'
        }
      });
      module.exports = Resource_Reports;