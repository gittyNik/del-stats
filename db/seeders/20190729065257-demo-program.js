const faker = require('faker');
const uuid = require('uuid/v4');

const demoProgram = {
  id: 'demo',
  name: 'Demo',
  location: faker.address.city(),
  duration: 2, //weeks
  test_series: {
    tests:[{
        duration: 15*60*1000, // Max durations in milliseconds
        purpose: 'know', // Purpose of having this test in series
        random: {generic: 5}, // Domains & counts of the random questions
        questions_fixed: [],  // An array of fixed questions
      },
      { duration: 15*60*1000, purpose: 'think', random: {tech: 1}},
      { duration: 15*60*1000, purpose: 'code', random: {tech: 1}},
      { duration: 15*60*1000, purpose: 'reflect', random: {mindsets: 5}},
    ],
  },
  milestone_review_rubric: {},
};

const milestone1 = {
  id: uuid(),
  name: 'Upward Spiral',
  program: 'demo',
};

const topicFactory = (title, milestone_id)=>({
  id: uuid(),
  title,
  description: faker.lorem.paragraph(),
  program: 'demo',
  milestone_id,
});

const resourceFactory = (topic_id)=>({
  id: uuid(),
  topic_id,
  url: faker.internet.url(),
  tags: [faker.lorem.slug(), faker.lorem.word(), faker.lorem.word()],
  level: 'beginner',
});

const topic1 = topicFactory('Photosynthesis', milestone1.id);
const topic2 = topicFactory('Climate change', milestone1.id);

const resource1 = resourceFactory(topic1.id);
const resource2 = resourceFactory(topic1.id);
const resource3 = resourceFactory(topic2.id);

module.exports = {
  up: (queryInterface, Sequelize) => {

    return queryInterface.sequelize.transaction((t) => {

      const addPrograms = queryInterface.bulkInsert('programs', [demoProgram],
        { transaction: t }, {
          test_series: { type: new Sequelize.JSON() },
          milestone_review_rubric: { type: new Sequelize.JSON() }
        });
      const addMilestones =  queryInterface.bulkInsert('milestones',
        [milestone1], { transaction: t });
      const addTopics = queryInterface.bulkInsert('topics',
        [topic1, topic2], { transaction: t });
      const addResources = queryInterface.bulkInsert('resources',
        [resource1, resource2, resource3], { transaction: t });

      return Promise.all([ addPrograms, ]);
    })
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction((t) => {
      return Promise.all([
        queryInterface.bulkDelete('programs', null, {}),
        queryInterface.bulkDelete('milestones', null, {}),
        queryInterface.bulkDelete('topics', null, {}),
        queryInterface.bulkDelete('resources', null, {}),
      ]);
    });
  }
};
