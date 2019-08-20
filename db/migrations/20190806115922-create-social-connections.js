const migration = {
  up: (queryInterface, Sequelize) => queryInterface.createTable('social_connections', {
    id: {
      type: Sequelize.UUID,
      primaryKey: true,
    },
    user_id: Sequelize.UUID,
    provider: Sequelize.STRING,
    username: {
      type: Sequelize.STRING,
      allowNull: true,
    },
    email: Sequelize.STRING,
    profile: Sequelize.JSON,
    access_token: Sequelize.STRING,
    expiry: Sequelize.DATE,
    created_at: Sequelize.DATE,
    updated_at: Sequelize.DATE,
  }),
  down: queryInterface => queryInterface.dropTable('social_connections'),
};

export default migration;
