const migration = {
  up: (queryInterface, Sequelize) => queryInterface.createTable('pings', {
    id: {
      type: Sequelize.UUID,
      primaryKey: true,
    },
    name: Sequelize.STRING,
    created_at: Sequelize.DATE,
    updated_at: Sequelize.DATE,
  }),
  down: queryInterface => queryInterface.dropTable('pings'),
};

export default migration;
