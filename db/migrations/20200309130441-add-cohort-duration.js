const migration = {
  up: (queryInterface, Sequelize) => queryInterface.addColumn('cohorts', 'duration', Sequelize.INTEGER),
  down: queryInterface => queryInterface.removeColumn('cohorts', 'duration'),
};

export default migration;
