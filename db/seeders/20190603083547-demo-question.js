'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.bulkInsert('questions', [{
      question: 'What is Node.js?',
      options: ['Library', 'Framework', 'Packages', 'javascript'],
      answer: [1,2,3],
    }], {});
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete('questions', null, {});
  }
};
