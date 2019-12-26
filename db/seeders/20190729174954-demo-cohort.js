import uuid from 'uuid/v4';
import faker from 'faker';

const createCohort = () => ({
  id: uuid(),
  name: faker.lorem.word(),
  program_id: 'demo',
  location: faker.address.city(),
  start_date: faker.date.future(0.5),
  learners: [],
  learning_ops_manager: null,
});

const seeder = {
  up: (queryInterface, Sequelize) => queryInterface.bulkInsert('cohorts', [
    createCohort(), createCohort(), createCohort(),
  ], {}, { learners: { type: Sequelize.ARRAY(Sequelize.UUID) } }),

  down: queryInterface => queryInterface.bulkDelete('cohorts', null, {}),
};

export default seeder;
