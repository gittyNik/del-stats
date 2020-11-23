import uuid from 'uuid/v4';
import faker from 'faker';
import _ from 'lodash';
import { randomNum, generateUuids } from '../../src/util/seederUtils';

const MILESTONE = {
  id: uuid(),
  name: faker.company.companyName(),
  // duration: randomNum(10),
  // alias: faker.lorem.word(),
  prerequisite_milestones: generateUuids(5),
  problem_statement: faker.lorem.paragraph(),
  // learning_competencies: [''],
  guidelines: faker.lorem.text(),
  starter_repo: faker.internet.domainName(),
  // releases: {},
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
  milestones: MILESTONE.id,
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

// breakout template hasn't migrated primary_catalyst and secondary_catalysts and updated by
const BREAKOUT_TEMPLATE = () => ({
  id: uuid(),
  name: faker.random.word(),
  topic_id: [TOPIC.id],
  mandatory: _.sample(true, false),
  level: _.sample(...BREAKOUT_LEVEL),
  primary_catalyst: uuid(),
  secondary_catalysts: generateUuids(),
  // Will have sandbox url,
  // {'sandbox': {'template': {}}, 'zoom': {}}
  duration: randomNum(60),
  time_scheduled: new Date(),
  after_days: randomNum(30),
  created_at: new Date(),
  updated_at: new Date(),
  updated_by: generateUuids(),
  cohort_duration: randomNum(60),
  program_id: DEMO_PROGRAM.id,
  status: _.sample(...TEMPLATE_STATUS),
  type: _.sample(...TEMPLATE_TYPE),
});

module.exports = {
  up: (queryInterface, Sequelize) => queryInterface.sequelize.transaction(async (t) => {
    const addMilestones = queryInterface.bulkInsert(
      'milestones',
      [MILESTONE], { transaction: t },
      { releases: { type: Sequelize.JSON() } },
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

    const addBreakoutTemplate = queryInterface.bulkInsert(
      'breakout_templates', _.times(100, BREAKOUT_TEMPLATE),
      { transaction: t },
      {
        details: { type: new Sequelize.JSON() },
      },
    );

    return Promise.all([addMilestones, addTopics, addPrograms, addBreakoutTemplate])
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
