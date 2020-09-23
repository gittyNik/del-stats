const migration = {
  up: (iface, Sequelize) => iface.sequelize.transaction(transaction => Promise.all([
    iface.addColumn('breakout_recordings', 'breakout_template_id', {
      type: Sequelize.UUID,
      references: { model: 'breakout_templates', key: 'id' },
    }, { transaction }),
  ])),
  down: (iface) => iface.sequelize.transaction(transaction => Promise.all([
    iface.removeColumn('breakout_recordings', 'breakout_template_id', { transaction }),
  ])),
};

export default migration;
