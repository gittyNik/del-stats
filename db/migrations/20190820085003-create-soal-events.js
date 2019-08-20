const migration = {
  up: (queryInterface, Sequelize) => queryInterface.createTable('soal_events', {
    id: {
      type: Sequelize.UUID,
      primaryKey: true,
    },
    name: Sequelize.STRING,
    type: Sequelize.STRING,
    manager: {
      type: Sequelize.UUID,
      references: { model: 'users', key: 'id' },
    },
    time: Sequelize.DATE,
    location: Sequelize.TEXT,
    details: Sequelize.JSON,
    created_at: Sequelize.DATE,
    updated_at: Sequelize.DATE,
  }),
  down: queryInterface => queryInterface.dropTable('soal_events'),
};

export default migration;
