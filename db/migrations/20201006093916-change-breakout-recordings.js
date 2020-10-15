const migration = {
  up: (qi, Sequelize) => qi.sequelize.transaction(transaction => Promise.all([
    qi.changeColumn('breakout_recordings', 'video_views', {
      type: Sequelize.INTEGER,
      defaultValue: 0,
    }, { transaction }),
  ])),
  down: (qi, Sequelize) => qi.sequelize.transaction(transaction => Promise.all([
    qi.changeColumn('breakout_recordings', 'video_views', {
      type: Sequelize.INTEGER,
      autoIncrement: true,
    }, { transaction }),
  ])),
};

export default migration;
