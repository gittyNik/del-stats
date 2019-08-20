
const uuid = require('uuid/v4');
const faker = require('faker');

module.exports = {
  up: (queryInterface, Sequelize) => queryInterface.bulkInsert('users', [{
    id: uuid(),
    name: 'John Doe',
    email: 'john@doe.com',
    phone: '9876543210',
  }], {}),

  down: (queryInterface, Sequelize) => queryInterface.bulkDelete('users', null, {}),
};
