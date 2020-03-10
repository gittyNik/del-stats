const migration = {
  up: (qi, Sequelize) => qi.sequelize.transaction(transaction => Promise.all([
    qi.changeColumn('video_meetings', 'start_url', {
      type: Sequelize.STRING(700)
    }, { transaction })
  ])),
  down: (qi, Sequelize) => qi.sequelize.transaction(transaction => Promise.all([
    qi.changeColumn('video_meetings', 'start_url', {
      type: Sequelize.STRING
    }, { transaction })
  ])),
};

export default migration;