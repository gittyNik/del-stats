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
    createdAt: Sequelize.DATE,
    updatedAt: Sequelize.DATE,
  }),
  down: (queryInterface, Sequelize) => queryInterface.dropTable('social_connections'),
};

export default migration;
