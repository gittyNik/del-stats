const migration = {
  up: (queryInterface, Sequelize) => queryInterface.addColumn('milestone_learner_teams', 'name', Sequelize.STRING),
  down: queryInterface => queryInterface.removeColumn('milestone_learner_teams', 'name'),
};

export default migration;
