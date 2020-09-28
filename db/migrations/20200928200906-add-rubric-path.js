const RUBRIC_PATH = [
  'frontend',
  'backend',
  'common',
];

module.exports = {
  up: (queryInterface, Sequelize) => queryInterface.sequelize.transaction(t => Promise.all([
    queryInterface.addColumn('rubrics', 'path', {
      type: Sequelize.ENUM(...RUBRIC_PATH),
      defaultValue: 'common',
    }, { transaction: t }),
  ])),

  down: (queryInterface) => queryInterface.sequelize.transaction(t => Promise.all([
    queryInterface.removeColumn('rubrics', 'path', { transaction: t }),
  ])),
};
