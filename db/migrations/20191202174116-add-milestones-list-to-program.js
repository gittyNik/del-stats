const migration = {
  up: (iface, Sequelize) => iface.sequelize.transaction(transaction => Promise.all([
    iface.removeColumn('milestones', 'program', { transaction }),
    iface.addColumn('programs', 'milestones', Sequelize.ARRAY(Sequelize.UUID), { transaction }),
  ])),
  down: (iface, Sequelize) => iface.sequelize.transaction(transaction => Promise.all([
    iface.addColumn('milestones', 'program', Sequelize.STRING, { transaction }),
    iface.removeColumn('programs', 'milestones', { transaction }),
  ])),
};

export default migration;
