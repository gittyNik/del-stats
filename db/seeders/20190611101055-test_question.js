'use strict';

var faker = require('faker');

const type = ['mcq', 'text', 'code'];

const isCorrect = [true, false];

var questions = [];

for(let c=1; c<=10; c++){
    let qtype = type[Math.floor(Math.random()*type.length)];
    if(qtype=='text'){
        let answers = [];
        let count = Math.floor(Math.random()*3) + 1;
        for(let i=1; i<=count; i++){
            answers.push(faker.lorem.sentence());
        }
        let text = {
            type: qtype,
            question: {
                question: faker.lorem.sentence(),
                image: faker.image.imageUrl(),
                answers: answers
            }
        }
        questions.push(text);
    }
    else if(qtype=='mcq'){
        let mcq = {
            type: qtype,
            question: {
                question: faker.lorem.sentence(),
                image: faker.image.imageUrl(),
                options: [
                    {
                        option: faker.lorem.sentence(),
                        image: faker.image.imageUrl(),
                        isCorrect: isCorrect[Math.floor(Math.random()*isCorrect.length)]
                    }, 
                    {
                        option: faker.lorem.sentence(),
                        image: faker.image.imageUrl(),
                        isCorrect: isCorrect[Math.floor(Math.random()*isCorrect.length)]
                    }, 
                    {
                        option: faker.lorem.sentence(),
                        image: faker.image.imageUrl(),
                        isCorrect: isCorrect[Math.floor(Math.random()*isCorrect.length)]
                    }, 
                    {
                        option: faker.lorem.sentence(),
                        image: faker.image.imageUrl(),
                        isCorrect: isCorrect[Math.floor(Math.random()*isCorrect.length)]
                    }, 
                ]
            }
        }
        questions.push(mcq);
    }
    else if(qtype=='code'){
        let code = {
            type: qtype,
            question: {
                question: faker.lorem.sentence(),
                image: faker.image.imageUrl(),
            }
        }
        questions.push(code);
    }
}

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.bulkInsert('test_questions', questions, {}, { question: { type: new Sequelize.JSON() } });
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete('test_questions', null, {});
  }
};

console.log(questions.length)
