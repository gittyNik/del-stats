import uuid from 'uuid/v4';
import faker from 'faker';
import _ from 'lodash';
import { randomNum } from '../../src/util/seederUtils';

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
    'archieved']
  ),
  stage: _.sample(...APPLICATION_STAGE),
  payment_details: Sequelize.JSON,
  is_isa: _.sample([true, false]),
  is_job_guarantee: _.sample([true, false]),
  created_at: new Date(),
  updated_at: new Date(),
  payment_type: 'UPI'
});

const TEST = (application_id) => ({
  id: uuid(),
  application_id,
  purpose: faker.lorem.sentence(),
  duration: randomNum(10000),
  responses: [{ id: uuid(), response: faker.lorem.sentence() }],
  scores: [randomNum(10), randomNum(10), randomNum(10)], // [syntax_score,logic_score,workflow_score]
  start_time: new Date(),
  sub_time: new Date(),
  browser_history: generateUuids(),
  created_at: new Date(),
  updated_at: new Date()
});

const seeder = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.bulkInsert('courses', [
      { title: 'Course 1', description: 'description 1', id: 1 },
      { title: 'Course 2', description: 'description 2', id: 2 }
    ], {});

    const users = await queryInterface.sequelize.query(
      `SELECT id from users;`
    );

    const cohorts = await queryInterface.sequelize.query(
      `SELECT id from cohorts;`
    );

    await queryInterface.bulkInsert(
      'applications',
      _.times(100, APPLICATIONS((_.sample(users)).id, (_.sample(cohorts)).id)),
      {});

    const applications = await queryInterface.sequelize.query(
      `SELECT id from applications;`
    );

    // eslint-disable-next-line no-return-await
    return await queryInterface.bulkInsert('tests',
      _.times(100, TEST((_.sample(applications)).id)),
      {});
  },

  down: async (queryInterface) => {
    await queryInterface.bulkDelete('applications', null, {});
    await queryInterface.bulkDelete('tests', null, {});
  },
};

export default seeder;
