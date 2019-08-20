const migration = {
  up: (queryInterface, Sequelize) => queryInterface.createTable('challenges', {
    id: {
      type: Sequelize.UUID,
      primaryKey: true,
    },
    name: Sequelize.STRING,
    created_at: Sequelize.DATE,
    updated_at: Sequelize.DATE,
  }),
  down: queryInterface => queryInterface.dropTable('challenges'),
};

export default migration;
