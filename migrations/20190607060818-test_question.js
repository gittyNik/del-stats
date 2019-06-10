'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('test_questions', {
      qid: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true
      },
      question: {
        type: Sequelize.STRING(500),
        allowNull: false
      },
      image: {
          type: Sequelize.STRING,
          allowNull: true
      },
      options: {
        type: Sequelize.ARRAY(Sequelize.JSON), // contains option, path, isCorrect
        allowNull: true
      }, 
      type: {
        type: Sequelize.STRING,
        allowNull: false
      },
      createdAt: {
        allowNull: false,
        defaultValue: new Date(),
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        defaultValue: new Date(),
        type: Sequelize.DATE
      }
    });
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('test_questions');
  }
};

