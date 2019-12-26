const migration = {
  up: (iface, Sequelize) => iface.sequelize.transaction(transaction => Promise.all([
    iface.addColumn('topics', 'optional', Sequelize.BOOLEAN, { transaction }),
    iface.addColumn('topics', 'visible', Sequelize.BOOLEAN, { transaction }),
  ])),
  down: (iface, Sequelize) => iface.sequelize.transaction(transaction => Promise.all([
    iface.removeColumn('topics', 'optional', Sequelize.BOOLEAN, { transaction }),
    iface.removeColumn('topics', 'visible', Sequelize.BOOLEAN, { transaction }),
  ])),
};

export default migration;
