module.exports = {
  up: (queryInterface, Sequelize) => queryInterface.sequelize.transaction(t => Promise.all([
    queryInterface.addColumn('agreement_templates', 'is_isa', {
      type: Sequelize.BOOLEAN,
      defaultValue: false,
    }, { transaction: t }),
  ])),

  down: (queryInterface) => queryInterface.sequelize.transaction(t => Promise.all([
    queryInterface.removeColumn('agreement_templates', 'is_isa', { transaction: t }),
  ])),
};
