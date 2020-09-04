const migration = {
  up: (iface, Sequelize) => iface.sequelize.transaction(transaction => Promise.all([
    iface.addColumn('documents', 'user_documents', {
      type: Sequelize.ARRAY(Sequelize.JSON),
    }, { transaction }),
  ])),
  down: (iface) => iface.sequelize.transaction(transaction => Promise.all([
    iface.removeColumn('documents', 'user_documents', { transaction }),
  ])),
};

export default migration;
