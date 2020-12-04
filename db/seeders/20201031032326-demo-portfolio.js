/* eslint-disable max-classes-per-file */
import uuid from 'uuid/v4';
import faker from 'faker';
import moment from 'moment';
import logger from '../../src/util/logger';

faker.locale = 'en_IND';

// data
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
const tag_ids = [
  '1e654d4e-adc8-44a1-b1b1-cdc1a7f60438',
  '5669f37e-7e6e-4bee-b49f-7b6fff96e962',
  '9c845722-fc13-4414-9fb9-552b128f5d8f',
  '823c2484-b7e0-4930-b882-b109245f10ab',
  'e2fec945-e831-43ef-9417-32120aae3db3',
  'b0f490f3-cb7d-4755-a9f9-ad3af4c1dc6b',
  '27cf70e6-6a0f-4ceb-a784-50657d58baae',
  'cf7ae808-3179-404c-acd4-f4b5b65963db',
  '4d1f4a5c-10a6-44db-83a5-bea0c253e2cc',
  '37d4628a-2592-4314-9dc2-96a76d022bc5',
  '53b9d43f-4f99-4e6f-a566-61ce89827cc6',
  '1edd6ed2-8e83-4da0-acf8-655d3e30484c',
  'fda98ecd-3c2a-4237-82ef-6db9abf7efe6',
  'b3c15cac-1a99-4ee4-b203-970430b35cce',
  '469feb42-be1d-408f-85e0-96c5ff401c44',
  '4f4b56f4-f384-46e6-9e4b-bf04c50d2c15',
  '2f3c21a3-68af-4f70-b661-fc75ecf30413',
  'ade4f09a-36f6-42a9-8689-6163b53f8eb6',
  '4659b95c-389f-4f29-886e-135b98cff0f9',
  'e7c9bdbd-0c9d-4b64-ab10-9e4f60eb61ca',
  '47655f36-b245-42f8-9246-a2e80fc85820',
];
const cities = [
  'Hyderabad',
  'Mumbai',
  'Bangalore',
  'Pune',
  'Delhi',
  'Gurgaon',
  'Chennai',
];
const HIRING_STATUS = [
  'available', 'currently-unavailable',
  'hired',
];
// Helper functions
function cleanArray(arr) {
  return `{"${arr.map(e => cleanEntry(e)).join('", "')}"}`;
}

function cleanEntry(obj) {
  return JSON.stringify(obj).replace(/"/g, '\\"');
}

const getSomeElements = (array) => faker.random.arrayElements(array, faker.random.number({
  min: 1, max: array.length,
}));

// Factory functions
const showcaseProjectFactory = () => ({
  title: `Milestone ${faker.random.number({ min: 1, max: 11 })}`,
  description: faker.lorem.sentences(),
  role_in_milestone: faker.lorem.sentences(),
  tech_stack: getSomeElements(tag_ids),
  start_date: moment(faker.date.past()).format('YYYY-MM-DD'),
  end_date: moment(faker.date.past()).format('YYYY-MM-DD'),
});

const educationalBackgroundFactory = () => ({
  title: faker.random.words(3),
  start_date: faker.date.past(),
  end_date: faker.date.past(),
  description: faker.lorem.sentences(),
  institute: faker.random.words(3),
});

const workExperienceFactory = () => ({
  title: faker.company.companyName(),
  start_date: faker.date.past(),
  end_date: faker.date.past(),
  description: faker.lorem.sentences(),
  position: faker.name.jobDescriptor(),
});
const skillExpLvlFactorry = () => ({
  field: faker.hacker.noun,
  experience: `${faker.random.number(7)} year`,
  score: faker.random.number({ min: 1, max: 10 }),
});

const timeSlotFactory = () => {
  let res = {};
  for (let i = 0; i < faker.random.number({ min: 2, max: 5 }); i++) {
    res[faker.date.weekday()] = [{
      start_time: '12:00:00',
      duration: 240,
    }, {
      start_time: '18:00:00',
      duration: 240,
    }];
  }
  return [(res)];
};

const capstoneProjectFactory = () => ({

  title: `${faker.hacker.adjective()} ${faker.hacker.noun()}`,
  description: faker.hacker.phrase,
  role_in_milestone: faker.name.jobType(),
  tech_stack: getSomeElements(tag_ids),
  duration: `${faker.date.past()} - ${faker.date.past()}`,

});

export const createPorfolio = (learner_id) => ({
  id: uuid(),
  learner_id,
  showcase_projects: cleanArray([showcaseProjectFactory()]),
  fields_of_interest: getSomeElements(tag_ids),
  city_choices: getSomeElements(cities),
  educational_background: cleanArray([educationalBackgroundFactory(), educationalBackgroundFactory()]),
  work_experience: cleanArray([workExperienceFactory(), workExperienceFactory()]),
  experience_level: `${faker.random.number(5)} year`,
  relevant_experience_level: `${faker.random.number(5)} year`,
  skill_experience_level: cleanArray([skillExpLvlFactorry(), skillExpLvlFactorry(), skillExpLvlFactorry()]),
  resume: {
    path: `${faker.system.directoryPath()}/resume.pdf`,
    updated_at: faker.date.past(),
  },
  review: faker.lorem.sentences(),
  reviewed_by: faker.random.arrayElement(learner_ids),
  tags: `{${getSomeElements(tag_ids).join(',')}}`,
  profile_views: faker.random.number({ min: 1, max: 500 }),
  status: 'available',
  hiring_status: faker.random.arrayElement(HIRING_STATUS),
  created_at: new Date(),
  available_time_slots: cleanArray(timeSlotFactory()),
  updated_by: cleanArray([{ user_id: '12345' }]),
  capstone_project: capstoneProjectFactory(),
  additional_links: cleanArray([{
    url: faker.internet.url(),
    description: faker.lorem.sentences(),
  }]),
});
// const p1 = createPorfolio(learner_ids[0]);
const createLinkedinSocialConnection = (learner_id) => ({
  id: uuid(),
  user_id: learner_id,
  provider: 'linkedin',
  username: faker.internet.userName(),
});

const seeder = {
  up: (queryInterface, Sequelize) => queryInterface.sequelize.transaction(t => {
    const addPortfolios = queryInterface.bulkInsert(
      'portfolios', learner_ids.map(createPorfolio),
      { transaction: t },
      {
        resume: { type: new Sequelize.JSON() },
        capstone_project: { type: new Sequelize.JSON() },
      },
    );
    const addLinkedin = queryInterface.bulkInsert(
      'social_connections', learner_ids.map(createLinkedinSocialConnection),
      { transaction: t },
    );
    return Promise.all([addPortfolios, addLinkedin])
      .then(() => logger.info('Seeded Porfolio and linkedin table'))
      .catch(err => {
        console.error(err);
        logger.info('=======================================');
        console.error(err.message);
      });
  }),

  down: (queryInterface, Sequelize) => queryInterface.sequelize.transaction(t => Promise.all([
    queryInterface.bulkDelete('portfolios', null, { transaction: t }),
    queryInterface.bulkDelete(
      'social_connections',
      {
        provider: 'linkedin',
      }, { transaction: t },
    ),
  ]))
    .then(() => logger.info('portfolio table is deleted and linkedin social connection are removed'))
    .catch(err => console.error(err)),
};

export default seeder;
