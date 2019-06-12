'use strict';
var faker = require('faker');
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.bulkInsert('tests', [{
      questions: [],
      user: "Library",
      generatetime: faker.date.past(),
      submittime: faker.date.future(),
      type: "coding",
      browserSession: []
    }], {});
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete('tests', null, {});
  }
};
