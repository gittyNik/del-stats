'use strict';
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('test_questions', {
    // id: {
    //     type: Sequelize.UUID,
    //     primaryKey: true,
    //     defaultValue: Sequelize.UUIDv4,
    // },
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: Sequelize.INTEGER
    },
    question: {
        type: Sequelize.JSON,
        allowNull: false,
      },
      type: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      createdAt: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW,
      },
      updatedAt: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW,
      },
    });
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('test_questions');
  }
};