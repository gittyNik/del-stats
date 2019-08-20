const uuid = require('uuid/v4');
const faker = require('faker');

const createCohort = () => ({
  id: uuid(),
  name: faker.lorem.word(),
  program_id: 'demo',
  location: faker.address.city(),
  start_date: faker.date.future(0.5),
  learners: [],
  learning_ops_manager: null,
});

module.exports = {
  up: (queryInterface, Sequelize) => queryInterface.bulkInsert('cohorts', [
    createCohort(), createCohort(), createCohort(),
  ], {}, { learners: { type: Sequelize.ARRAY(Sequelize.UUID) } }),

  down: (queryInterface, Sequelize) => queryInterface.bulkDelete('cohorts', null, {}),
};
