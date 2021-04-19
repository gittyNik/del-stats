module.exports = {
  up: (queryInterface, Sequelize) => queryInterface.sequelize.transaction(t => Promise.all([
    queryInterface.addColumn('learner_breakouts', 'attendance_details', Sequelize.JSON, { transaction: t }),

  ])),

  down: (queryInterface) => queryInterface.sequelize.transaction(t => Promise.all([
    queryInterface.removeColumn('learner_breakouts', 'attendance_details', { transaction: t }),
  ])),
};
