module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('milestones', {
      id: {
        primaryKey: true,
        allowNull: false,
        type: Sequelize.UUID,
      },
      name : {
        allowNull : false,
        type : Sequelize.STRING
      },
      program: Sequelize.STRING,
      createdAt: {
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
    return queryInterface.dropTable('milestones');
  }
};
