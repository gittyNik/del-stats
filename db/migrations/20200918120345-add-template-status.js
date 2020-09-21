const TEMPLATE_STATUS = [
  'active',
  'inactive',
];

module.exports = {
  up: (queryInterface, Sequelize) => queryInterface.sequelize.transaction(t => Promise.all([
    queryInterface.addColumn('breakout_templates', 'status', {
      type: Sequelize.ENUM(...TEMPLATE_STATUS),
      defaultValue: 'active',
    }, { transaction: t }),
  ])),

  down: (queryInterface) => queryInterface.sequelize.transaction(t => Promise.all([
    queryInterface.removeColumn('breakout_templates', 'status', { transaction: t }),
  ])),
};
