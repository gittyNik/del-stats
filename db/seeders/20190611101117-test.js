'use strict';
var faker = require('faker');
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.bulkInsert('tests', [{
      questions: [1,2,3,4,5],
      user: "Library",
      generateTime: faker.date.past(),
      submitTime: faker.date.future(),
      type: "coding",
      browserSession: [faker.internet.url(), faker.internet.url(), faker.internet.url()]
    }], {});
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete('tests', null, {});
  }
};
