'use strict';

const questions = [
  {
    question: {
      question: "sdfghjhgfdsa",
      path: "qwertyhjjhgfdsas",
      options:[{
        option:"sdfghjkjhgfd",
        isCorrect: true
      }]
    }, // this is a JSON column
    type: "mcq"
  }
]
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.bulkInsert('test_questions', questions, {}, { question: { type: new Sequelize.JSON() } });
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete('test_questions', null, {});
  }
};
