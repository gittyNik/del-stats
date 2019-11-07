const migration = {
  up: (queryInterface, Sequelize) => queryInterface.addColumn('tests', 'start_time', Sequelize.DATE),
  down: queryInterface => queryInterface.removeColumn('tests', 'start_time'),
};

export default migration;
