const migration = {
  up: (queryInterface, Sequelize) => queryInterface.addColumn('cohort_breakouts', 'team_feedback', Sequelize.JSON),
  down: queryInterface => queryInterface.removeColumn('cohort_breakouts', 'team_feedback'),
};

export default migration;
