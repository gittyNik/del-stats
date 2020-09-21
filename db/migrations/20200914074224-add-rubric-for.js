const RUBRIC_FOR = [
  'individual',
  'team',
];

module.exports = {
  up: (queryInterface, Sequelize) => queryInterface.sequelize.transaction(t => Promise.all([
    queryInterface.addColumn('rubrics', 'rubric_for', {
      type: Sequelize.ENUM(...RUBRIC_FOR),
      defaultValue: 'individual',
    }, { transaction: t }),
  ])),

  down: (queryInterface) => queryInterface.sequelize.transaction(t => Promise.all([
    queryInterface.removeColumn('rubrics', 'rubric_for', { transaction: t }),
  ])),
};
