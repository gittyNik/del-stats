'use strict';

import Sequelize from 'sequelize';

module.exports =
  class Resource_reports extends Sequelize.Model {
    static init(sequelize) {
      return super.init({
        user_id: {
          type: Sequelize.UUID,
        },
        resource_id: {
          type: Sequelize.UUID,
          allowNull: false,
          references: { model: 'resources', key: 'id' }
        },
        vote: {
          type: Sequelize.STRING,
          allowNull:false
        }
      }, { sequelize })
    };

    static associate(models) {
      this.belongsTo(models.Resources)
    }
  }