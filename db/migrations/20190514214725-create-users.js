const migration = {
  up: (queryInterface, Sequelize) => queryInterface.createTable('users', {
    id: {
      allowNull: false,
      primaryKey: true,
      type: Sequelize.UUID,
    },
    name: Sequelize.STRING,
    email: Sequelize.STRING,
    phone: Sequelize.STRING,
    role: Sequelize.STRING,
    location: Sequelize.STRING,
    profile: Sequelize.JSON,
    createdAt: Sequelize.DATE,
    updatedAt: Sequelize.DATE,
  }),
  down: queryInterface => queryInterface.dropTable('users'),
};

export default migration;
