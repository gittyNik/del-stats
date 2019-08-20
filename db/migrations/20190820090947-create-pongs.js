const migration = {
  up: (queryInterface, Sequelize) => queryInterface.createTable('pongs', {
    id: {
      type: Sequelize.UUID,
      primaryKey: true,
    },
    name: Sequelize.STRING,
    created_at: Sequelize.DATE,
    updated_at: Sequelize.DATE,
  }),
  down: queryInterface => queryInterface.dropTable('pongs'),
};

export default migration;
