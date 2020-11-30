import uuid from 'uuid/v4';
import faker from 'faker';
import _ from 'lodash';
import { randomNum, generateUuids, cleanJSON } from '../../src/util/seederUtils';

const PROGRAM = {
  id: uuid(),
  name: faker.name.firstName(),
  location: faker.address.streetAddress(true),
  // milestones: Sequelize.ARRAY(Sequelize.UUID), // todo: add not null
  duration: randomNum(10), // in weeks
  created_at: new Date(),
  updated_at: new Date(),
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

// cohorts.learning_ops_manager dont have reference to users
const COHORT = {
  id: uuid(),
  status: _.sample(COHORT_STATUS),
  type: _.sample(COHORT_TYPE),
  name: faker.name.firstName(),
  location: faker.address.streetAddress(),
  // learners: Sequelize.ARRAY(Sequelize.UUID),
  program_id: PROGRAM.id,
  start_date: new Date(),
  learning_ops_manager: uuid(),
  duration: randomNum(10),
};

const MILESTONE = {
  id: uuid(),
  name: faker.lorem.word(),
  duration: randomNum(10),
  alias: faker.lorem.word(),
  prerequisite_milestones: generateUuids(5),
  problem_statement: faker.lorem.paragraph(),
  learning_competencies: _.times(3, faker.lorem.word),
  guidelines: faker.lorem.text(),
  starter_repo: faker.internet.domainName(),
  releases: cleanJSON({
    id: uuid(),
    createdAt: new Date(),
  }),
  created_at: new Date(),
  updated_by: null,
};

// Refrences are not migrated in tags
// owner and moderators

const USER_ROLES = ['learner', 'educator', 'enabler', 'catalyst', 'admin',
  'guest', 'superadmin', 'reviewer', 'operations', 'recruiter', 'career-services'];

const USER = {
  id: uuid(),
  name: faker.name.firstName(),
  email: faker.internet.email(),
  phone: faker.phone.phoneNumber('+91##########'),
  role: _.sample(USER_ROLES),
  location: faker.address.city(),
};

const COHORT_MILESTONE = {
  id: uuid(),
  release_time: faker.date.past(),
  cohort_id: COHORT.id,
  milestone_id: MILESTONE.id,
  reviewer_id: USER.id,
  review_scheduled: new Date(),
  review_time: new Date(),
  created_at: faker.date.past(),
  updated_at: new Date(),
};

// learners are not referenced to users with 'learner' role
const MILESTONE_LEARNER_TEAMS = () => ({
  id: uuid(),
  name: faker.random.word(),
  cohort_milestone_id: COHORT_MILESTONE.id,
  learners: generateUuids(),
  github_repo_link: faker.internet.domainName(),
  product_demo_link: faker.internet.domainName(),
  review: faker.lorem.sentence(),
  reviewed_by: USER.id,
  created_at: new Date(),
  updated_at: new Date(),
});

module.exports = {
  up: (queryInterface, Sequelize) => queryInterface.sequelize.transaction(async (t) => {
    const addProgram = queryInterface.bulkInsert(
      'programs', [PROGRAM],
      { transaction: t },
      {
        test_series: { type: new Sequelize.JSON() },
        milestone_review_rubric: { type: new Sequelize.JSON() },
      },
    );

    const addCohort = queryInterface.bulkInsert(
      'cohorts', [COHORT],
      { transaction: t },
    );

    const addMilestones = queryInterface.bulkInsert(
      'milestones',
      [MILESTONE], { transaction: t },
      { releases: { type: new Sequelize.JSON() } },
    );

    const addUser = queryInterface.bulkInsert(
      'users', [USER],
      { transaction: t },
      {
        profile: { type: new Sequelize.JSON() },
        status: { type: new Sequelize.ARRAY(Sequelize.JSON) },
        status_reason: { type: new Sequelize.ARRAY(Sequelize.JSON) },
      },
    );

    const addCohortMilestone = queryInterface.bulkInsert(
      'cohort_milestones', [COHORT_MILESTONE],
      { transaction: t },
      {},
    );

    const addMilestoneLearnerTeams = queryInterface.bulkInsert(
      'milestone_learner_teams', _.times(100, MILESTONE_LEARNER_TEAMS),
      { transaction: t },
      {},
    );

    return Promise.all([addProgram, addMilestones, addCohort, addUser,
      addCohortMilestone, addMilestoneLearnerTeams])
      .then(() => console.log('Seeded Milestone Learner Teams'))
      .catch(err => console.error(err));
  }),

  down: async queryInterface => queryInterface.sequelize.transaction(t => Promise.all([
    queryInterface.bulkDelete('milestones', null, { transaction: t }),
    queryInterface.bulkDelete('cohorts', null, { transaction: t }),
    queryInterface.bulkDelete('programs', null, { transaction: t }),
    queryInterface.bulkDelete('users', null, { transaction: t }),
    queryInterface.bulkDelete('programs', null, { transaction: t }),
    queryInterface.bulkDelete('milestone_learner_teams', null, { transaction: t }),
  ])
    .then(() => console.log('milestones, cohorts, programs, users, cohort Milestones, milestone_learner_teams reverted'))
    .catch(err => console.error(err))),
};
