const migration = {
  up: (queryInterface, Sequelize) => queryInterface.createTable('portfolios', {
    id: {
      type: Sequelize.UUID,
      primaryKey: true,
    },
    name: Sequelize.STRING,
    created_at: Sequelize.DATE,
    updated_at: Sequelize.DATE,
  }),
  down: queryInterface => queryInterface.dropTable('portfolios'),
};

export default migration;
