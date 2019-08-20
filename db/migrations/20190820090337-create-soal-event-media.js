const migration = {
  up: (queryInterface, Sequelize) => queryInterface.createTable('soal_event_media', {
    id: {
      type: Sequelize.UUID,
      primaryKey: true,
    },
    event_id: {
      type: Sequelize.UUID,
      references: { model: 'soal_events', key: 'id' },
    },
    name: Sequelize.STRING,
    url: Sequelize.STRING,
    text: Sequelize.TEXT,
    attachment: Sequelize.BLOB,
    created_at: Sequelize.DATE,
    updated_at: Sequelize.DATE,
  }),
  down: queryInterface => queryInterface.dropTable('soal_event_media'),
};

export default migration;
