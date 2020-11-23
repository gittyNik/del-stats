import uuid from 'uuid/v4';
import faker from 'faker';
import _ from 'lodash';
import { randomNum } from '../../src/util/seederUtils';

// for cohort
const PROGRAM = {
  id: uuid(),
  name: faker.name.firstName(),
  location: faker.address.streetAddress(true),
  // milestones: Sequelize.ARRAY(Sequelize.UUID), // todo: add not null
  duration: randomNum(10), // in weeks
  created_at: new Date(),
  updated_at: new Date(),
};

// for cohort
const LEARNING_OPS_MANAGER = {
  id: uuid(),
  name: faker.name.firstName(),
  email: faker.internet.email(),
  phone: faker.phone.phoneNumber(),
  role: 'operations',
  location: faker.address.streetAddress(true),
};

const COHORT_STATUS = [
  'upcoming',
  'live',
  'completed',
  'deferred',
  'reallocated',
  'suitup',
  'filled',
  'fast-filling',
];

const COHORT_TYPE = [
  'hybrid',
  'remote',
];

// for cohort assessment
const COHORT = {
  id: uuid(),
  status: _.sample(COHORT_STATUS),
  type: _.sample(COHORT_TYPE),
  name: faker.name.firstName(),
  location: faker.address.streetAddress(),
  // learners: Sequelize.ARRAY(Sequelize.UUID),
  program_id: PROGRAM.id,
  start_date: new Date(),
  learning_ops_manager: LEARNING_OPS_MANAGER.id,
  duration: randomNum(10),
};

// for cohort assessment
const CATALYST = {
  id: uuid(),
  name: faker.name.firstName(),
  email: faker.internet.email(),
  phone: faker.phone.phoneNumber(),
  role: 'operations',
  location: faker.address.streetAddress(true),
};

// for learner assessment
const COHORT_ASSESSMENT = {
  id: uuid(),
  cohort_id: COHORT.id,
  catalyst_id: CATALYST.id,
  location: faker.address.streetAddress(true),
  time_scheduled: new Date(),
};

// for learner assessment
const LEARNER = {
  id: uuid(),
  name: faker.name.firstName(),
  email: faker.internet.email(),
  phone: faker.phone.phoneNumber(),
  role: 'learner',
  location: faker.address.streetAddress(true),
};

// for learner assessment
const REVIEWED_BY = {
  id: uuid(),
  name: faker.name.firstName(),
  email: faker.internet.email(),
  phone: faker.phone.phoneNumber(),
  role: 'educator',
  location: faker.address.streetAddress(true),
};

const LearnerAssessment = () => ({
  id: uuid(),
  cohort_assessment_id: COHORT_ASSESSMENT.id,
  learner_id: LEARNER.id,
  review: faker.lorem.sentence(),
  reviewed_by: REVIEWED_BY.id,
  learner_feedback: faker.lorem.paragraph(),
});

const seeder = {
  up: async (queryInterface, Sequelize) => queryInterface.sequelize.transaction(async (t) => {
    const addProgram = queryInterface.bulkInsert(
      'programs', [PROGRAM],
      { transaction: t },
      {
        test_series: { type: Sequelize.JSON() },
        milestone_review_rubric: { type: Sequelize.JSON() },
      },
    );

    const addLearning_ops_manager = queryInterface.bulkInsert(
      'users', [LEARNING_OPS_MANAGER],
      { transaction: t },
      {
        profile: { type: new Sequelize.JSON() },
        status: { type: new Sequelize.ARRAY(Sequelize.JSON) },
        status_reason: { type: new Sequelize.ARRAY(Sequelize.JSON) },
      },
    );

    const addCohort = queryInterface.bulkInsert(
      'cohorts', [COHORT],
      { transaction: t },
    );

    const addCatalyst = queryInterface.bulkInsert(
      'users', [CATALYST],
      { transaction: t },
      {
        profile: { type: new Sequelize.JSON() },
        status: { type: new Sequelize.ARRAY(Sequelize.JSON) },
        status_reason: { type: new Sequelize.ARRAY(Sequelize.JSON) },
      },
    );

    const LearnerAssessments = await queryInterface.sequelize.query(
      `SELECT id from assessments;`
    );

    COHORT_ASSESSMENT.assessment_id = LearnerAssessments[0].id;

    const addCohortAssessment = queryInterface.bulkInsert(
      'cohort_assessments', [COHORT_ASSESSMENT],
      { transaction: t },
    );

    const addLearner = queryInterface.bulkInsert(
      'users', [LEARNER],
      { transaction: t },
      {
        profile: { type: new Sequelize.JSON() },
        status: { type: new Sequelize.ARRAY(Sequelize.JSON) },
        status_reason: { type: new Sequelize.ARRAY(Sequelize.JSON) },
      },
    );

    const addReviewedBy = queryInterface.bulkInsert(
      'users', [REVIEWED_BY],
      { transaction: t },
      {
        profile: { type: new Sequelize.JSON() },
        status: { type: new Sequelize.ARRAY(Sequelize.JSON) },
        status_reason: { type: new Sequelize.ARRAY(Sequelize.JSON) },
      },
    );

    const addLearnerAssessment = queryInterface.bulkInsert(
      'assessments', [LearnerAssessment],
      { transaction: t },
    );

    return Promise.all([
      addProgram, addLearning_ops_manager,
      addCohort, addCatalyst, addCohortAssessment,
      addLearner, addReviewedBy, addLearnerAssessment])
      .then(() => console.log('Seeded LearnerAssessment'))
      .catch(err => console.error(err));
  }),

  down: async queryInterface => queryInterface.sequelize.transaction(t => Promise.all([
    queryInterface.bulkDelete('users', null, { transaction: t }),
    queryInterface.bulkDelete('ping_templates', null, { transaction: t }),
    queryInterface.bulkDelete('pings', null, { transaction: t }),
  ])
    .then(() => console.log('LearnerAssessment reverted'))
    .catch(err => console.error(err))),
};

export default seeder;
