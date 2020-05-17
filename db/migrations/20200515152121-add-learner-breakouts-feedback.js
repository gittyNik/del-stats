const migration = {
  up: (queryInterface, Sequelize) => queryInterface.addColumn('learner_breakouts', 'review_feedback', Sequelize.JSON),
  down: queryInterface => queryInterface.removeColumn('learner_breakouts', 'review_feedback'),
};

export default migration;
