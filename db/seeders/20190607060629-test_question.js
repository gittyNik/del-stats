'use strict';
var options1=[
    {
      option : "Framework",
    }
  ];

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.bulkInsert('test_questions', [{
      question : 'What is Node.js?',
      image : "some path to image",
      options : options1,
      type : "coding",
    }], {}, { options1: { type: new Sequelize.JSON} });
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete('test_questions', null, {});
  }
};
