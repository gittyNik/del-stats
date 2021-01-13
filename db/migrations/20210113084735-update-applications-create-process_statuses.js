/* eslint-disable no-unused-vars */
module.exports = {
  up: (queryInterface, Sequelize) => queryInterface.sequelize.transaction(t => Promise.all([
    queryInterface.addColumn('applications', 'process_statuses', {
      type: Sequelize.ARRAY(Sequelize.JSON),
    }, { transaction: t }),
  ])),
  down: (queryInterface, Sequelize) => queryInterface.sequelize.transaction(t => Promise.all([
    queryInterface.removeColumn('applications', 'process_statuses', { transaction: t }),
  ])),
};
