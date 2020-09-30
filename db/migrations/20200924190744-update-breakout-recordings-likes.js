const migration = {
  up: (iface, Sequelize) => iface.sequelize.transaction(transaction => Promise.all([
    iface.addColumn('breakout_recordings', 'video_views', {
      type: Sequelize.INTEGER,
      autoIncrement: true,
    }, { transaction }),
    iface.removeColumn('breakout_recordings', 'likes', { transaction }),
    iface.removeColumn('breakout_recordings', 'views', { transaction }),
  ])),
  down: (iface, Sequelize) => iface.sequelize.transaction(transaction => Promise.all([
    iface.addColumn('breakout_recordings', 'views', {
      type: Sequelize.INTEGER,
      defaultValue: 0,
    }, { transaction }),
    iface.addColumn('breakout_recordings', 'likes', {
      type: Sequelize.INTEGER,
      autoIncrement: true,
    }, { transaction }),
    iface.removeColumn('breakout_recordings', 'video_views', { transaction }),
  ])),
};

export default migration;
