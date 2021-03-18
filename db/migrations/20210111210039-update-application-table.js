'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => queryInterface.sequelize.transaction(transaction => Promise.all([
    queryInterface.addColumn('applications', 'upfront_plan_5_enabled', {
      type: Sequelize.BOOLEAN,
      defaultValue: false,
    }, { transaction }),
  ])),

  down: (queryInterface) => queryInterface.sequelize.transaction(transaction => Promise.all([
    queryInterface.removeColumn('applications', 'upfront_plan_5_enabled', { transaction }),
  ])),
};
