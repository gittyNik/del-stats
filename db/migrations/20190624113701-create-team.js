module.exports = {
  up: (queryInterface, Sequelize) => queryInterface.createTable('teams', {
    id: {
      allowNull: false,
      primaryKey: true,
      type: Sequelize.UUID,
    },
    name: {
      allowNull: false,
      type: Sequelize.STRING,
    },
    createdAt: {
      allowNull: false,
      type: Sequelize.DATE,
    },
    updatedAt: {
      allowNull: false,
      type: Sequelize.DATE,
    },
  }),
  down: (queryInterface, Sequelize) => queryInterface.dropTable('teams'),
};
