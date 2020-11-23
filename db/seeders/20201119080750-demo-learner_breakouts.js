import uuid from 'uuid/v4';
import faker from 'faker';
import _ from 'lodash';
import { randomNum, generateUuids } from '../../src/util/seederUtils';

const MILESTONE = {
  id: uuid(),
  name: faker.company.companyName(),
  duration: randomNum(10),
  alias: faker.lorem.word(),
  prerequisite_milestones: generateUuids(5),
  problem_statement: faker.lorem.paragraph(),
  // learning_competencies: [''],
  guidelines: faker.lorem.text(),
  starter_repo: faker.internet.domainName(),
  // releases: {},
  created_at: new Date(),
  updated_by: null,
};

const BREAKOUT_PATH = [
  'frontend',
  'backend',
  'common',
];

const TOPIC = {
  id: uuid(),
  title: faker.lorem.sentence(randomNum(6)),
  description: faker.lorem.text(),
  program: 'demo',
  milestone_id: MILESTONE.id,
  optional: false,
  visible: true,
  domain: _.sample(['generic', 'tech', 'mindset', 'dsa']),
  created_at: new Date(),
  updated_at: new Date(),
  path: _.sample(BREAKOUT_PATH),
};

const BREAKOUT_LEVEL = ['beginner', 'intermediate', 'advanced'];

const TEMPLATE_STATUS = [
  'active',
  'inactive',
];

const TEMPLATE_TYPE = [
  'recurring',
  'scheduled',
  'independent',
];

// for cohort assessment
const CATALYST = {
  id: uuid(),
  name: faker.name.firstName(),
  email: faker.internet.email(),
  phone: faker.phone.phoneNumber(),
  role: 'operations',
  location: faker.address.streetAddress(true),
};

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

const BREAKOUT_TEMPLATES = {
  id: uuid(),
  name: faker.name.firstName(),
  topic_id: TOPIC.id,
  mandatory: _.sample([false, true]),
  level: _.sample(...BREAKOUT_LEVEL),
  primary_catalyst: CATALYST.id,
  secondary_catalysts: [CATALYST.id],
  duration: randomNum(10),
  time_scheduled: new Date(),
  after_days: randomNum(10),
  created_at: new Date(),
  updated_at: new Date(),
  updated_by: [CATALYST.id],
  cohort_duration: randomNum(10),
  program_id: PROGRAM.id,
  status: _.sample(...TEMPLATE_STATUS),
  type: _.sample(...TEMPLATE_TYPE),
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

const BREAKOUT_TYPE = ['codealong', 'activity', 'groupdiscussion'];
const EVENT_STATUS = ['scheduled', 'started', 'cancelled', 'aborted', 'running'];

const TEAM_BREAKOUT = {
  id: uuid(),
  team_id: uuid(),
  type: _.sample(...BREAKOUT_TYPE),
  time_scheduled: new Date(),
  status: _.sample(...EVENT_STATUS),
  duration: 18000000,
  notes: faker.lorem.sentence(10),
  created_at: new Date(),
  updated_at: new Date(),
};

// for learner breakout
const COHORT_BREAKOUT = {
  id: uuid(),
  type: _.sample(BREAKOUT_TYPE),
  breakout_template_id: BREAKOUT_TEMPLATES.id,
  domain: faker.internet.domainName(),
  topic_id: uuid(),
  cohort_id: uuid(),
  time_scheduled: new Date(),
  duration: 1800000 * 3,
  location: faker.address.streetAddress(true),
  catalyst_id: CATALYST.id,
  status: _.sample(...EVENT_STATUS),
  catalyst_notes: faker.lorem.sentence(),
  catalyst_feedback: faker.lorem.sentence(),
  attendance_count: randomNum(120),
  updated_by: [CATALYST.id],
  time_taken_by_catalyst: randomNum(180000000),
  time_started: new Date(),
};

// for learner breakout
const LEARNER = {
  id: uuid(),
  name: faker.name.firstName(),
  email: faker.internet.email(),
  phone: faker.phone.phoneNumber(),
  role: 'learner',
  location: faker.address.streetAddress(true),
};

const LEARNER_BREAKOUT = {
  id: uuid(),
  cohort_breakout_id: COHORT_BREAKOUT.id,
  learner_id: LEARNER.id,
  learner_notes: faker.lorem.sentence(),
  learner_feedback: faker.lorem.sentence(10),
  team_breakout_id: TEAM_BREAKOUT.id,
  attendance: _.sample([true, false]),
  created_at: new Date(),
  updated_at: new Date(),
};

const seeder = {
  up: (queryInterface, Sequelize) => queryInterface.sequelize.transaction((t) => {

    const addMilestones = queryInterface.bulkInsert(
      'milestones',
      [MILESTONE], { transaction: t },
      { releases: { type: Sequelize.JSON() } },
    );

    const addTopics = queryInterface.bulkInsert(
      'topics',
      [TOPIC], { transaction: t },
    );

    const addProgram = queryInterface.bulkInsert(
      'programs', [PROGRAM],
      { transaction: t },
      {
        test_series: { type: Sequelize.JSON() },
        milestone_review_rubric: { type: Sequelize.JSON() },
      },
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

    const addBreakoutTemplate = queryInterface.bulkInsert(
      '', [BREAKOUT_TEMPLATES],
      { transaction: t },
      { details: { type: Sequelize.JSON() }, }
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

    const addTeamBreakout = queryInterface.bulkInsert(
      'team_breakout', [TEAM_BREAKOUT],
      { transaction: t },
      { details: { type: Sequelize.JSON() }, }
    )

    const addLearner = queryInterface.bulkInsert(
      'users', [LEARNER],
      { transaction: t },
      {
        profile: { type: new Sequelize.JSON() },
        status: { type: new Sequelize.ARRAY(Sequelize.JSON) },
        status_reason: { type: new Sequelize.ARRAY(Sequelize.JSON) },
      },
    );

    const addCohortBreakout = queryInterface.bulkInsert(
      'cohort_breakouts', [COHORT_BREAKOUT],
      { transaction: t },
      {
        details: { type: Sequelize.JSON() },
        team_feedback: { type: Sequelize.JSON() },
      });

    const addLearnerBreakout = queryInterface.bulkInsert(
      'learner_breakouts', [LEARNER_BREAKOUT],
      { transaction: t },
      {
        review_feedback: { type: Sequelize.JSON() },
      },
    );

    return Promise.all([
      addProgram, addLearning_ops_manager, addTeamBreakout,
      addCohort, addCatalyst, addMilestones, addTopics, addBreakoutTemplate,
      addLearner, addLearnerBreakout, addCohortBreakout])
      .then(() => console.log('Seeded learner breakouts'))
      .catch(err => console.error(err));
  }),

  down: queryInterface => queryInterface.sequelize.transaction(t => Promise.all([
    queryInterface.bulkDelete('programs', null, { transaction: t }),
    queryInterface.bulkDelete('resources', null, { transaction: t }),
    queryInterface.bulkDelete('topics', null, { transaction: t }),
    queryInterface.bulkDelete('milestones', null, { transaction: t }),
  ])
    .then(() => console.log('milestones, programs, resources, topics reverted.'))
    .catch(err => console.error(err))),
};

export default seeder;
