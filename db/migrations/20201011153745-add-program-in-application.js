const migration = {
  up: (iface, Sequelize) => iface.sequelize.transaction(transaction => Promise.all([
    iface.addColumn('applications', 'program_id', {
      type: Sequelize.STRING,
      references: { model: 'programs', key: 'id' },
    }, { transaction }),
  ])),
  down: (iface) => iface.sequelize.transaction(transaction => Promise.all([
    iface.removeColumn('applications', 'program_id', { transaction }),
  ])),
};

export default migration;

