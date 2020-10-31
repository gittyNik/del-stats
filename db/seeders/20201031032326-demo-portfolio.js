import uuid from 'uuid/v4';
import faker from 'faker';

const cohort_id = '8c4bb88a-f961-4d92-ac90-962c352e23b0';

const learner_ids = [
  '023a7137-500c-4ae9-a559-cb322fd69ddb',
  '3dca2c03-a1af-420a-9212-ba0b8d340fbb',
  '5ad468d0-ab54-46a6-8b50-06dd6e1f560e',
  'a75b7172-b2b8-496f-b76b-7c2574208e9e',
  '5ad1e4c0-b762-404e-a842-6a417b0515e3',
  '72fc70e4-34e3-4c22-9847-34145b48423b',
  '2cde3ae3-4853-44e6-a236-d95b6599cd4a',
  '416c2d88-1391-497e-88d5-86789c704aa4',
  'bf264050-5c07-4541-80eb-93a139887183',
];

const createPorfolio = (learner_id) => ({
  id: uuid(),
  learner_id,
  status: 'available',
  hiring_status: 'available',
  created_at: new Date(),
});
const p1 = createPorfolio(learner_ids[0]);

const seeder = {
  up: (queryInterface, Sequelize) => queryInterface.sequelize.transaction(t => {
    const addPortfolios = queryInterface.bulkInsert(
      'portfolios', learner_ids.map(createPorfolio),
      { transaction: t },
    );
    return Promise.all([addPortfolios])
      .then(() => console.log('Seeded Porfolio'))
      .catch(err => console.error(err));
  }),

  down: (queryInterface, Sequelize) => queryInterface.sequelize.transaction(t => Promise.all([
    queryInterface.buldDelete('porfolios', null, { transaction: t }),
  ]))
    .then(() => console.log('portfolio table is deleted'))
    .catch(err => console.error(err)),
};

export default seeder;
