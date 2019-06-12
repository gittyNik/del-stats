module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('topics', {
      id: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.UUID
      },
      title: {
        type: Sequelize.STRING
      },
      description: {
        type: Sequelize.TEXT
      },
      program: {
        type: Sequelize.STRING
      },
      milestone_number: {
        type: Sequelize.INTEGER
      },
      createdAt:
       {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,

        type: Sequelize.DATE
      }
    });
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('topics');
  }
};