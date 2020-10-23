module.exports = {
  up: (queryInterface, Sequelize) => queryInterface.sequelize.transaction(t => Promise.all([
    queryInterface.addColumn('cohort_breakouts', 'time_taken_by_catalyst', {
      type: Sequelize.INTEGER,
    }, { transaction: t }),
    queryInterface.addColumn('cohort_breakouts', 'time_started', {
      type: Sequelize.DATE,
    }, { transaction: t }),
  ])),

  down: (queryInterface) => queryInterface.sequelize.transaction(t => Promise.all([
    queryInterface.removeColumn('cohort_breakouts', 'time_taken_by_catalyst', { transaction: t }),
    queryInterface.removeColumn('cohort_breakouts', 'time_started', { transaction: t }),
  ])),
};
