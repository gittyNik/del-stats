const BREAKOUT_PATH = [
  'frontend',
  'backend',
  'common',
];

module.exports = {
  up: (queryInterface, Sequelize) => queryInterface.sequelize.transaction(t => Promise.all([
    queryInterface.addColumn('topics', 'path', {
      type: Sequelize.ENUM(...BREAKOUT_PATH),
      defaultValue: 'common',
    }, { transaction: t }),
  ])),

  down: (queryInterface) => queryInterface.sequelize.transaction(t => Promise.all([
    queryInterface.removeColumn('topics', 'path', { transaction: t }),
  ])),
};
