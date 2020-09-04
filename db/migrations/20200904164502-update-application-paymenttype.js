const migration = {
  up: (iface, Sequelize) => iface.sequelize.transaction(transaction => Promise.all([
    iface.addColumn('applications', 'payment_type', {
      type: Sequelize.STRING,
    }, { transaction }),
  ])),
  down: (iface) => iface.sequelize.transaction(transaction => Promise.all([
    iface.removeColumn('applications', 'payment_type', { transaction }),
  ])),
};

export default migration;
