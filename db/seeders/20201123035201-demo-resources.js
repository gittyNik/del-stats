import { v4 as uuid } from 'uuid';
import faker from 'faker';
import _ from 'lodash';
import {
  randomNum, generateUuids, cleanJSON, compatibleArray,
} from '../../src/util/seederUtils';

const MILESTONE = {
  id: uuid(),
  name: faker.lorem.word(),
  duration: randomNum(10),
  alias: faker.lorem.word(),
  prerequisite_milestones: generateUuids(5),
  problem_statement: faker.lorem.paragraph(),
  learning_competencies: _.times(5, faker.lorem.word),
  guidelines: faker.lorem.text(),
  starter_repo: faker.internet.domainName(),
  releases: cleanJSON({
    id: uuid(),
    createdAt: new Date(),
  }),
  created_at: new Date(),
  updated_by: null,
};

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

// Refrences are not migrated in tags
// owner and moderators

const DEMO_PROGRAM = {
  id: uuid(),
  name: faker.random.word(),
  location: faker.address.city(),
  milestones: generateUuids(),
  duration: 2, // weeks
  test_series: {
    tests: [{
      duration: 15 * 60 * 1000, // Max durations in milliseconds
      purpose: 'know', // Purpose of having this test in series
      random: { generic: 5 }, // Domains & counts of the random questions
      questions_fixed: [], // An array of fixed questions
      typesAllowed: ['mcq', 'rate'],
      // rubric: [{measure: 'syntax', optionls:[], weight, text, quote: {text, author}}]
    },
    {
      duration: 15 * 60 * 1000,
      purpose: 'think',
      typesAllowed: ['logo'],
      random: { tech: 1 },
    },
    {
      duration: 15 * 60 * 1000,
      purpose: 'play',
      typesAllowed: ['code'],
      random: { tech: 1 },
    },
    {
      duration: 15 * 60 * 1000,
      purpose: 'reflect',
      typesAllowed: ['mcq', 'rate'],
      random: { mindsets: 5 },
    },
    ],
  },
  milestone_review_rubric: {},
};

const USER_ROLES = ['learner', 'educator', 'enabler', 'catalyst', 'admin',
  'guest', 'superadmin', 'reviewer', 'operations', 'recruiter', 'career-services'];

const USER = {
  id: uuid(),
  name: faker.name.firstName(),
  email: faker.internet.email(),
  phone: faker.phone.phoneNumber('91##########'),
  role: _.sample(USER_ROLES),
  location: faker.address.city(),
};

const RESOURCE = () => ({
  id: uuid(),
  topic_id: TOPIC.id,
  url: faker.internet.domainName(),
  owner: USER.id,
  moderator: USER.id,
  thumbnail: faker.internet.avatar(),
  type: _.sample(['article', 'repo', 'video', 'tweet']),
  program: DEMO_PROGRAM.id,
  add_time: new Date(),
  level: _.sample(['beginner', 'intermediate', 'advanced']),
  tags: _.times(3, faker.random.word),
  tagged: compatibleArray([TOPIC.id]),
});

module.exports = {
  up: (queryInterface, Sequelize) => queryInterface.sequelize.transaction(async (t) => {
    const addMilestones = queryInterface.bulkInsert(
      'milestones',
      [MILESTONE], { transaction: t },
      { releases: { type: new Sequelize.JSON() } },
    );

    const addTopics = queryInterface.bulkInsert(
      'topics',
      [TOPIC], { transaction: t },
    );

    const addPrograms = queryInterface.bulkInsert(
      'programs', [DEMO_PROGRAM],
      { transaction: t },
      {
        test_series: { type: new Sequelize.JSON() },
        milestone_review_rubric: { type: new Sequelize.JSON() },
      },
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

    const addResources = queryInterface.bulkInsert(
      'resources', _.times(100, RESOURCE),
      { transaction: t },
      {},
    );

    return Promise.all([addMilestones, addTopics, addPrograms, addUser, addResources])
      .then(() => console.log('Seeded Resources'))
      .catch(err => console.error(err));
  }),

  down: async queryInterface => queryInterface.sequelize.transaction(t => Promise.all([
    queryInterface.bulkDelete('milestones', null, { transaction: t }),
    queryInterface.bulkDelete('topics', null, { transaction: t }),
    queryInterface.bulkDelete('programs', null, { transaction: t }),
    queryInterface.bulkDelete('users', null, { transaction: t }),
    queryInterface.bulkDelete('resources', null, { transaction: t }),
  ])
    .then(() => console.log('milestones, topics, programs, users and resources reverted'))
    .catch(err => console.error(err))),
};
