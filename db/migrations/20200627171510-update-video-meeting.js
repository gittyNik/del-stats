const migration = {
  up: (queryInterface, Sequelize) => queryInterface.addColumn('video_meetings', 'zoom_user', Sequelize.STRING),
  down: queryInterface => queryInterface.removeColumn('video_meetings', 'zoom_user'),
};

export default migration;
