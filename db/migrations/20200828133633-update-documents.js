const migration = {
  up: (iface, Sequelize) => iface.sequelize.transaction(transaction => Promise.all([
    iface.addColumn('documents', 'updated_by', {
      type: Sequelize.ARRAY(Sequelize.JSON),
    }, { transaction }),
  ])),
  down: (iface) => iface.sequelize.transaction(transaction => Promise.all([
    iface.removeColumn('documents', 'updated_by', { transaction }),
  ])),
};

export default migration;
