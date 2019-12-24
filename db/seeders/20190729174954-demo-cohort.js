import uuid from 'uuid/v4';
import faker from 'faker';
import { Program } from '../../src/models/program';

const getProgramId = () => {
  Program.findAll({})
    .then(data => data[0].id)
    .catch(err => console.log(err));
};

const createCohort = () => ({
  id: uuid(),
  name: faker.lorem.word(),
  program_id: getProgramId(),
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
