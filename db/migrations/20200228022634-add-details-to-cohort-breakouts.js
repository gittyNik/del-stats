const migration = {
  up: (queryInterface, Sequelize) => queryInterface.addColumn('cohort_breakouts', 'details', Sequelize.JSON),
  down: queryInterface => queryInterface.removeColumn('cohort_breakouts', 'details'),
};

export default migration;
