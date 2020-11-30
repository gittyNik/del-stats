import uuid from 'uuid/v4';
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
  // path: _.sample(BREAKOUT_PATH),
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

const TEMPLATE_STATUS = [
  'active',
  'inactive',
];

const TEMPLATE_TYPE = [
  'recurring',
  'scheduled',
  'independent',
];

const BREAKOUT_LEVEL = ['beginner', 'intermediate', 'advanced'];

const CATALYST = {
  id: uuid(),
  name: faker.name.firstName(),
  email: faker.internet.email(),
  phone: faker.phone.phoneNumber(),
  role: 'operations',
  location: faker.address.streetAddress(true),
};

const BREAKOUT_TEMPLATE = () => ({
  id: uuid(),
  name: faker.random.word(),
  topic_id: generateUuids(),
  mandatory: _.sample(true, false),
  level: _.sample(BREAKOUT_LEVEL),
  primary_catalyst: CATALYST.id,
  secondary_catalysts: compatibleArray([CATALYST.id]),
  // Will have sandbox url,
  // {'sandbox': {'template': {}}, 'zoom': {}}
  duration: randomNum(60),
  time_scheduled: new Date(),
  after_days: randomNum(30),
  created_at: new Date(),
  updated_at: new Date(),
  updated_by: null,
  cohort_duration: randomNum(60),
  program_id: DEMO_PROGRAM.id,
  status: _.sample(TEMPLATE_STATUS),
  type: _.sample(TEMPLATE_TYPE),
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

    const addCatalyst = queryInterface.bulkInsert(
      'users', [CATALYST],
      { transaction: t },
      {
        profile: { type: new Sequelize.JSON() },
        status: { type: new Sequelize.ARRAY(Sequelize.JSON) },
        status_reason: { type: new Sequelize.ARRAY(Sequelize.JSON) },
      },
    );

    const addPrograms = queryInterface.bulkInsert(
      'programs', [DEMO_PROGRAM],
      { transaction: t },
      {
        test_series: { type: new Sequelize.JSON() },
        milestone_review_rubric: { type: new Sequelize.JSON() },
      },
    );

    const addBreakoutTemplate = queryInterface.bulkInsert(
      'breakout_templates', _.times(100, BREAKOUT_TEMPLATE),
      { transaction: t },
      {
        details: { type: new Sequelize.JSON() },
      },
    );

    return Promise.all([addMilestones, addTopics, addPrograms, addCatalyst, addBreakoutTemplate])
      .then(() => console.log('Seeded Breakout Templates'))
      .catch(err => console.error(err));
  }),

  down: async queryInterface => queryInterface.sequelize.transaction(t => Promise.all([
    queryInterface.bulkDelete('milestones', null, { transaction: t }),
    queryInterface.bulkDelete('topics', null, { transaction: t }),
    queryInterface.bulkDelete('programs', null, { transaction: t }),
    queryInterface.bulkDelete('breakout_templates', null, { transaction: t }),
  ])
    .then(() => console.log('milestones, topics, programs and breakout_templates reverted'))
    .catch(err => console.error(err))),
};
