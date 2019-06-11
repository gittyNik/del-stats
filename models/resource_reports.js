'use strict';

import Sequelize from 'sequelize';

module.exports =
  class Resource_reports extends Sequelize.Model {
    static init(sequelize) {
      return super.init({
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
      }, { sequelize })
    };

    static associate(models) {
      this.belongsTo(models.Resources)
    }
  }