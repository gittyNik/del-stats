const migration = {
  up: (queryInterface, Sequelize) => queryInterface.addColumn('tests', 'scores', Sequelize.ARRAY(Sequelize.INTEGER)),
  down: queryInterface => queryInterface.removeColumn('tests', 'scores'),
};

export default migration;
