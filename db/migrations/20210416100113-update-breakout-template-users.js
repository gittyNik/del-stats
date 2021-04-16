module.exports = {
  up: (queryInterface, Sequelize) => queryInterface.sequelize.transaction(t => Promise.all([
    queryInterface.addColumn('breakout_templates', 'updated_by_user', Sequelize.ARRAY(Sequelize.JSON), { transaction: t }),
    queryInterface.removeColumn('breakout_templates', 'updated_by', { transaction: t }),
  ])),

  down: (queryInterface, Sequelize) => queryInterface.sequelize.transaction(t => Promise.all([
    queryInterface.removeColumn('breakout_templates', 'updated_by_user', { transaction: t }),
    queryInterface.addColumn('breakout_templates', 'updated_by', {
      type: Sequelize.ARRAY(
        {
          type: Sequelize.UUID,
          references: { model: 'users' },
        },
      ),
      allowNull: true,
    }, { transaction: t }),
  ])),
};
