'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction(t => {
      return Promise.all([
        queryInterface.addColumn('resources', 'tagged', {
          type: Sequelize.ARRAY({
            type: Sequelize.UUID,
            allowNull: true,
            references: { model: 'topics' }
          })
        }, { transaction: t })
      ]);
    });
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction(t => {
      return Promise.all([
        queryInterface.removeColumn('resources', 'tagged', { transaction: t })
      ]);
    });
  }
};