module.exports = {
  up: (queryInterface, Sequelize) => queryInterface.sequelize.transaction(t => Promise.all([
    queryInterface.addColumn('agreement_templates', 'agreement_identifier', {
      type: Sequelize.STRING,
      allowNull: false,
    }, { transaction: t }),
  ])),

  down: (queryInterface) => queryInterface.sequelize.transaction(t => Promise.all([
    queryInterface.removeColumn('agreement_templates', 'agreement_identifier', { transaction: t }),
  ])),
};
