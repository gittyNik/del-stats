const COHORT_TYPE = [
  'hybrid',
  'remote',
];

module.exports = {
  up: (queryInterface, Sequelize) => queryInterface.sequelize.transaction(t => Promise.all([
    queryInterface.addColumn('cohorts', 'type', {
      type: Sequelize.ENUM(...COHORT_TYPE),
      defaultValue: 'hybrid',
    }, { transaction: t }),
  ])),

  down: (queryInterface, Sequelize) => queryInterface.sequelize.transaction(t => Promise.all([
    queryInterface.removeColumn('cohorts', 'type', { transaction: t }),
  ])),
};
