const migration = {
  up: (iface, Sequelize) => iface.sequelize.transaction(transaction => Promise.all([
    iface.addColumn('cohort_breakouts', 'updated_by', {
      type: Sequelize.ARRAY(
        {
          type: Sequelize.UUID,
          references: { model: 'users' },
        },
      ),
      allowNull: true,
    }, { transaction }),
  ])),
  down: (iface) => iface.sequelize.transaction(transaction => Promise.all([
    iface.removeColumn('cohort_breakouts', 'updated_by', { transaction }),
  ])),
};

export default migration;
