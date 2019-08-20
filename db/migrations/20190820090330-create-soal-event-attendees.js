const migration = {
  up: (queryInterface, Sequelize) => queryInterface.createTable('soal_event_attendees', {
    id: {
      type: Sequelize.UUID,
      primaryKey: true,
    },
    name: Sequelize.STRING,
    created_at: Sequelize.DATE,
    updated_at: Sequelize.DATE,
  }),
  down: queryInterface => queryInterface.dropTable('soal_event_attendees'),
};

export default migration;
