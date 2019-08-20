const migration = {
  up: (queryInterface, Sequelize) => queryInterface.createTable('soal_events', {
    id: {
      type: Sequelize.UUID,
      primaryKey: true,
    },
    name: Sequelize.STRING,
    created_at: Sequelize.DATE,
    updated_at: Sequelize.DATE,
  }),
  down: queryInterface => queryInterface.dropTable('soal_events'),
};

export default migration;
