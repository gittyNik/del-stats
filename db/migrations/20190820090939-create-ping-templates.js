const migration = {
  up: (queryInterface, Sequelize) => queryInterface.createTable('ping_templates', {
    id: {
      type: Sequelize.UUID,
      primaryKey: true,
    },
    name: Sequelize.STRING,
    created_at: Sequelize.DATE,
    updated_at: Sequelize.DATE,
  }),
  down: queryInterface => queryInterface.dropTable('ping_templates'),
};

export default migration;
