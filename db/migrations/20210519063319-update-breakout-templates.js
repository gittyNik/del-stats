module.exports = {
  up: (queryInterface, Sequelize) => queryInterface.sequelize.transaction(t => Promise.all([
    queryInterface.addColumn('breakout_templates', 'catalyst_breakout', {
      type: Sequelize.BOOLEAN,
      defaultValue: false,
    }, { transaction: t }),
    queryInterface.addColumn('breakout_templates', 'assign_primary_catalyst', {
      type: Sequelize.BOOLEAN,
      defaultValue: false,
    }, { transaction: t }),
  ])),

  down: (queryInterface) => queryInterface.sequelize.transaction(t => Promise.all([
    queryInterface.removeColumn('breakout_templates', 'catalyst_breakout', { transaction: t }),
    queryInterface.removeColumn('breakout_templates', 'assign_primary_catalyst', { transaction: t }),
  ])),
};
