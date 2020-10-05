const migration = {

  up: (queryInterface, Sequelize) => queryInterface.createTable('breakout_recordings_details', {
    id: {
      type: Sequelize.UUID,
      defaultValue: Sequelize.UUIDV4,
      primaryKey: true,
    },
    created_at: {
      type: Sequelize.DATE,
    },
    updated_at: {
      type: Sequelize.DATE,
      defaultValue: Sequelize.literal('NOW()'),
    },
    video_id: {
      type: Sequelize.UUID,
      references: { model: 'breakout_recordings', key: 'id' },
    },
    user_id: {
      type: Sequelize.UUID,
      references: { model: 'users', key: 'id' },
    },
    liked_by_user: {
      type: Sequelize.BOOLEAN,
      defaultValue: false,
    },
    breakout_rating: {
      type: Sequelize.INTEGER,
      allowNull: true,
      defaultValue: 0,
      validate: {
        min: 0,
        max: 4,
      },
    },
  }),
  down: queryInterface => queryInterface.dropTable('breakout_recordings_details'),
};

export default migration;
