module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('users', {
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
    });
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('users');
  }
};
