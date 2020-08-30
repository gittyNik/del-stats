const migration = {
  up: (iface, Sequelize) => iface.sequelize.transaction(transaction => Promise.all([
    iface.addColumn('documents', 'updated_by', {
      type: Sequelize.ARRAY(Sequelize.JSON),
    }, { transaction }),
    iface.removeColumn('documents', 'payment_status'),
    iface.removeColumn('documents', 'is_isa'),
  ])),
  down: (iface, Sequelize) => iface.sequelize.transaction(transaction => Promise.all([
    iface.addColumn('documents', 'payment_status', {
      type: Sequelize.JSON,
      allowNull: true,
    }, { transaction }),
    iface.addColumn('documents', 'is_isa', {
      type: Sequelize.BOOLEAN,
      defaultValue: false,
    }, { transaction }),
    iface.removeColumn('documents', 'updated_by'),
  ])),
};

export default migration;
