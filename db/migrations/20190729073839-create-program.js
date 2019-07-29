'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('programs', {
      id: Sequelize.STRING,
      name: Sequelize.STRING,
      location: Sequelize.STRING,
      duration: Sequelize.INTEGER, //in weeks
      test_template: Sequelize.JSON,
      milestone_review_rubric: Sequelize.JSON,
      createdAt: Sequelize.DATE,
      updatedAt: Sequelize.DATE,
    });
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('programs');
  }
};
