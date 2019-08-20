const faker = require('faker');
const uuid = require('uuid/v4');

const demoProgram = {
  id: 'demo',
  name: 'Demo',
  location: faker.address.city(),
  duration: 2, // weeks
  test_series: {
    tests: [{
      duration: 15 * 60 * 1000, // Max durations in milliseconds
      purpose: 'know', // Purpose of having this test in series
      random: { generic: 5 }, // Domains & counts of the random questions
      questions_fixed: [], // An array of fixed questions
      typesAllowed: ['mcq', 'rate'],
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

const milestone1 = {
  id: uuid(),
  name: 'Upward Spiral',
  program: 'demo',
};

const topicFactory = (title, milestoneId) => ({
  id: uuid(),
  title,
  description: faker.lorem.paragraph(),
  program: 'demo',
  milestone_id: milestoneId,
});

const resourceFactory = topicId => ({
  id: uuid(),
  topic_id: topicId,
  url: faker.internet.url(),
  tags: [faker.lorem.slug(), faker.lorem.word(), faker.lorem.word()],
  level: 'beginner',
});

const topic1 = topicFactory('Photosynthesis', milestone1.id);
const topic2 = topicFactory('Climate change', milestone1.id);

const resource1 = resourceFactory(topic1.id);
const resource2 = resourceFactory(topic1.id);
const resource3 = resourceFactory(topic2.id);

const seeder = {
  up: (queryInterface, Sequelize) => queryInterface.sequelize.transaction((t) => {
    const addPrograms = queryInterface.bulkInsert(
      'programs', [demoProgram],
      { transaction: t }, {
        test_series: { type: new Sequelize.JSON() },
        milestone_review_rubric: { type: new Sequelize.JSON() },
      },
    );
    const addMilestones = queryInterface.bulkInsert(
      'milestones',
      [milestone1], { transaction: t },
    );
    const addTopics = queryInterface.bulkInsert(
      'topics',
      [topic1, topic2], { transaction: t },
    );
    const addResources = queryInterface.bulkInsert(
      'resources',
      [resource1, resource2, resource3], { transaction: t },
    );

    return Promise.all([addPrograms, addMilestones, addTopics, addResources]);
  }),

  down: queryInterface => queryInterface.sequelize.transaction(t => Promise.all([
    queryInterface.bulkDelete('programs', null, { transaction: t }),
    queryInterface.bulkDelete('milestones', null, { transaction: t }),
    queryInterface.bulkDelete('topics', null, { transaction: t }),
    queryInterface.bulkDelete('resources', null, { transaction: t }),
  ])),
};

export default seeder;
