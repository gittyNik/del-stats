
const migration = {

  up: (queryInterface, Sequelize) => queryInterface.createTable('video_meetings', {
    id: {
      type: Sequelize.UUID,
      primaryKey: true,
    },
    video_id: Sequelize.STRING,
    start_url: Sequelize.STRING,
    join_url: Sequelize.STRING,
    start_time: Sequelize.STRING, // zoom time format
    duration: Sequelize.STRING,
    created_at: {
      allowNull: false,
      type: Sequelize.DATE,
    },
    updated_at: {
      allowNull: false,
      type: Sequelize.DATE,
    },
  }),
  down: queryInterface => queryInterface.dropTable('video_meetings'),
};

export default migration;
