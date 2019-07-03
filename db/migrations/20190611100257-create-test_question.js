module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('test_questions', {
    id: {
      type: Sequelize.UUID,
      primaryKey: true,
      },
    question: {
        type: Sequelize.JSON,
        allowNull: false,
      },
    type: {
        type: Sequelize.ENUM('mcq', 'text', 'code'),
        allowNull: false,
      },
    domain: {
        type: Sequelize.ENUM('generic', 'tech', 'mindsets'),
        allowNull: false,
      },
    createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
      },
    updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
      },
    });
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('test_questions');
  }
};
