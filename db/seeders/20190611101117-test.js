'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.bulkInsert('tests', [{
      questions: [],
      user: "Library",
      generateTime: new Date(),
      submitTime: new Date(),
      type: "coding",
      browserSession: []
    }], {});
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete('tests', null, {});
  }
};
