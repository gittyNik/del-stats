const migration = {
  up: (iface, Sequelize) => iface.sequelize.transaction(transaction => Promise.all([
    iface.addColumn('learner_breakouts', 'team_breakout_id', {
      type: Sequelize.UUID,
      references: { model: 'team_breakout', key: 'id' },
    }, { transaction }),
    iface.addColumn('learner_breakouts', 'attendance', Sequelize.BOOLEAN, { transaction }),
  ])),
  down: (iface, Sequelize) => iface.sequelize.transaction(transaction => Promise.all([
    iface.removeColumn('learner_breakouts', 'team_breakout_id', {
      type: Sequelize.UUID,
      references: { model: 'team_breakout', key: 'id' },
    }, { transaction }),
    iface.removeColumn('learner_breakouts', 'attendance', Sequelize.BOOLEAN, { transaction }),
  ])),
};

export default migration;
