import { v4 as uuid } from 'uuid';
import faker from 'faker';
import _ from 'lodash';
import {
  randomNum, generateArray, cleanArray, generateUuids,
} from '../../src/util/seederUtils';

const APPLICATION_STAGE = [
  'firewall-test', 'isa-selection', 'cohort-selection_payment',
  'cohort-selection_job-guarantee',
  'cohort-selection-loan', 'verification-digio-document-creation',
  'verification-digio-esign',
  'verification-document-upload', 'verification-document-verified',
  'payment_full',
  'authorisation-github', 'authorisation-zoom',
];

const APPLICATIONS = (user_id, cohort_applied) => ({
  id: uuid(),
  user_id,
  cohort_applied,
  cohort_joining: cohort_applied,
  status: _.sample([
    'applied',
    'review_pending',
    'offered',
    'rejected',
    'joined',
    'archieved']),
  stage: _.sample(APPLICATION_STAGE),
  is_isa: _.sample([true, false]),
  is_job_guarantee: _.sample([true, false]),
  created_at: new Date(),
  updated_at: new Date(),
  payment_type: 'UPI',
});

const TEST = (application_id) => ({
  id: uuid(),
  application_id,
  purpose: faker.lorem.sentence(),
  duration: randomNum(10000),
  responses: cleanArray([{ response: faker.lorem.sentence() }]), // array of json
  scores: [randomNum(10), randomNum(10), randomNum(10)],
  start_time: new Date(),
  sub_time: faker.date.future(),
  browser_history: generateUuids(),
  created_at: new Date(),
  updated_at: new Date(),
});

const seeder = {
  up: async (queryInterface, Sequelize) => {
    const users = await queryInterface.sequelize.query(
      `SELECT id from users;`
    );

    const cohorts = await queryInterface.sequelize.query(
      `SELECT id from cohorts;`
    );

    await queryInterface.bulkInsert(
      'applications',
      generateArray(10, APPLICATIONS, [(_.sample(users[0])).id, (_.sample(cohorts[0])).id]),
      { payment_details: { type: new Sequelize.JSON() } },
    );

    const applications = await queryInterface.sequelize.query(
      `SELECT id from applications;`
    );

    // eslint-disable-next-line no-return-await
    return await queryInterface.bulkInsert('tests',
      generateArray(100, TEST, [(_.sample(applications[0])).id]),
      {
        application_id: { type: new Sequelize.UUID() },
        browser_history: { type: new Sequelize.UUID() },
        responses: { type: Sequelize.JSON },
      });
  },

  down: async (queryInterface) => {
    await queryInterface.bulkDelete('applications', null, {});
    await queryInterface.bulkDelete('tests', null, {});
  },
};

export default seeder;
