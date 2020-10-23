const TEMPLATE_TYPE = [
  'recurring',
  'scheduled',
  'independent',
];

module.exports = {
  up: (queryInterface, Sequelize) => queryInterface.sequelize.transaction(t => Promise.all([
    queryInterface.addColumn('breakout_templates', 'type', {
      type: Sequelize.ENUM(...TEMPLATE_TYPE),
      defaultValue: 'scheduled',
    }, { transaction: t }),
  ])),

  down: (queryInterface) => queryInterface.sequelize.transaction(t => Promise.all([
    queryInterface.removeColumn('breakout_templates', 'type', { transaction: t }),
  ])),
};
