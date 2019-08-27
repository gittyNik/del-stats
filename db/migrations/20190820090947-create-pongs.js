const migration = {
  up: (queryInterface, Sequelize) => queryInterface.createTable('pongs', {
    id: {
      type: Sequelize.UUID,
      primaryKey: true,
    },
    ping_id: {
      type: Sequelize.UUID,
      references: { model: 'pings', key: 'id' },
    },
    learner_id: {
      type: Sequelize.UUID,
      references: { model: 'users', key: 'id' },
    },
    response: Sequelize.JSON,
    created_at: Sequelize.DATE, // response_time
    updated_at: Sequelize.DATE,
  }),
  down: queryInterface => queryInterface.dropTable('pongs'),
};

export default migration;
