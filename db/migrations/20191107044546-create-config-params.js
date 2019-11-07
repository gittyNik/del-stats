const migration = {
  up: (queryInterface, Sequelize) => queryInterface.createTable('config_params', {
    id: {
      type: Sequelize.UUID,
      primaryKey: true,
    },
    key: Sequelize.STRING,
    value: Sequelize.TEXT,
    details: Sequelize.JSON,
    created_at: Sequelize.DATE,
    updated_at: Sequelize.DATE,
  }),
  down: queryInterface => queryInterface.dropTable('config_params'),
};

export default migration;
