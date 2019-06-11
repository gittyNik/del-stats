'use strict';

import Sequelize from 'sequelize';

module.exports =
  class Resource_comments extends Sequelize.Model {
    static init(sequelize) {
      return super.init({
        resource_id: {
          type: Sequelize.UUID,
          references: { model: 'resources', key: 'id' }
        },
        comment: {
          type: Sequelize.TEXT,
          allowNull: false,
        },
      }, { sequelize })
    };

    static associate(models) {
      this.belongsTo(models.Resources)
    }
  }