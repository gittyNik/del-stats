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
}

const topic1 = {
  id: uuid(),
  title: 'Photosynthesis',
  description: faker.lorem.paragraph(),
  program: 'demo',
  milestone_id: milestone1.id,
}

const topic2 = {
  id: uuid(),
  title: 'Climate change',
  description: faker.lorem.paragraph(),
  program: 'demo',
  milestone_id: milestone1.id,
}

const articleResource1 = {
  id: uuid(),
  topic_id: topic1.id,
  url: faker.internet.url(),
  tags: [faker.lorem.slug(), faker.lorem.word(), faker.lorem.word()],
  level: 'beginner',
}

const articleResource2 = {
  id: uuid(),
  topic_id: topic2.id,
  url: faker.internet.url(),
  tags: [faker.lorem.slug(), faker.lorem.word(), faker.lorem.word()],
  level: 'beginner',
}
const articleResource3 = {
  id: uuid(),
  topic_id: topic1.id,
  url: faker.internet.url(),
  tags: [faker.lorem.slug(), faker.lorem.word(), faker.lorem.word()],
  level: 'beginner',
}

module.exports = {
  up: (queryInterface, Sequelize) => {

    return queryInterface.sequelize.transaction((t) => {

      const addPrograms = queryInterface.bulkInsert('programs', [demoProgram],
        { transaction: t }, {
          test_series: { type: new Sequelize.JSON() },
          milestone_review_rubric: { type: new Sequelize.JSON() }
        });
      // const addResources = queryInterface.bulkInsert('resources', [],
      //   { transaction: t });
      // const addMilestones =  queryInterface.bulkInsert('milestones', [],
      //   { transaction: t });

      return Promise.all([ addPrograms]);
      // return Promise.all([ addPrograms, addResources, addMilestones]);
    })
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction((t) => {
      return Promise.all([
        queryInterface.bulkDelete('programs', null, {}),
        queryInterface.bulkDelete('resources', null, {}),
        queryInterface.bulkDelete('milestones', null, {}),
      ]);
    });
  }
};
