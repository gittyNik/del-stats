const uuid = require('uuid/v4');
const faker = require('faker');

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.bulkInsert('cohorts', [{
      id: uuid(),
      name: faker.lorem.word(),
      program_id: 'demo',
      location: faker.address.city(),
      start_date: faker.date.future(0.1),
      learners: [],
      learning_ops_manager: null,
    }], {}, { learners: {type:Sequelize.ARRAY(Sequelize.UUID)}});
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete('cohorts', null, {});
  }
};
