'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction(t => {
      return Promise.all([
        queryInterface.addColumn('tags', 'similar_tags', {
          type: Sequelize.ARRAY({
            type: Sequelize.UUID,
            allowNull: true
          })
        }, { transaction: t })
      ]);
    });
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction(t => {
      return Promise.all([
        queryInterface.removeColumn('tags', 'similar_tags', { transaction: t })
      ]);
    });
  }
};