
const migration = {
  up: (queryInterface, Sequelize) => queryInterface.createTable('breakout_recordings', {
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
    topics_array: {
      type: Sequelize.ARRAY(
        {
          type: Sequelize.UUID,
          references: { model: 'topics' },
        },
      ),
      allowNull: false,
    },
    recording_url: Sequelize.STRING,
    recording_details: {
      type: Sequelize.JSON,
      allowNull: true,
    },
    views: {
      type: Sequelize.INTEGER,
      defaultValue: 0,
    },
    likes: {
      type: Sequelize.INTEGER,
      autoIncrement: true,
    },
    catalyst_id: {
      type: Sequelize.UUID,
      references: { model: 'users', key: 'id' },
    },
  }),
  down: queryInterface => queryInterface.dropTable('breakout_recordings'),
};

export default migration;
