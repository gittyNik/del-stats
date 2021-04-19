module.exports = {
  up: (queryInterface, Sequelize) => queryInterface.sequelize.transaction(t => Promise.all([
    queryInterface.addColumn('cohort_breakouts', 'updated_by_user', Sequelize.ARRAY(Sequelize.JSON), { transaction: t }),
    queryInterface.removeColumn('cohort_breakouts', 'updated_by', { transaction: t }),
  ])),

  down: (queryInterface, Sequelize) => queryInterface.sequelize.transaction(t => Promise.all([
    queryInterface.removeColumn('cohort_breakouts', 'updated_by_user', { transaction: t }),
    queryInterface.addColumn('cohort_breakouts', 'updated_by', {
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
