import uuid from 'uuid/v4';
import faker from 'faker';
import _ from 'lodash';
import { randomNum, generateUuids, cleanJSON } from '../../src/util/seederUtils';

// milestones
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

// program
const PROGRAM = {
  id: uuid(),
  name: faker.name.firstName(),
  location: faker.address.streetAddress(true),
  // milestones: Sequelize.ARRAY(Sequelize.UUID), // todo: add not null
  duration: randomNum(10), // in weeks
  created_at: new Date(),
  updated_at: new Date(),
};

// user for resource visit and moderator for resources
const USER = {
  id: uuid(),
  name: faker.name.firstName(),
  email: faker.internet.email(),
  phone: faker.phone.phoneNumber('+91##########'),
  role: 'learner',
  location: faker.address.city(),
  // picture: faker.internet.avatar(), not migrated on table
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

const RESOURCE = {
  id: uuid(),
  topic_id: TOPIC.id,
  url: faker.internet.domainName(),
  owner: USER.id,
  moderator: USER.id,
  thumbnail: faker.internet.avatar(),
  type: _.sample(['article', 'repo', 'video', 'tweet']),
  program: PROGRAM.id,
  add_time: new Date(),
  level: _.sample(['beginner', 'intermediate', 'advanced']),
  tags: ['tag 1', 'tag 2', 'tag 3'],
  tagged: null,
  title: faker.lorem.sentence(5),
  description: faker.lorem.paragraph(),
  source: faker.internet.domainName(), // slack/web
};

const RESOURCE_VISITS = () => ({
  id: uuid(),
  resource_id: RESOURCE.id,
  user_id: USER.id,
  source: faker.internet.domainName(),
  created_at: new Date(),
  updated_at: new Date(),
  details: {
    visits: randomNum(20000),
  },
});

const seeder = {
  up: (queryInterface, Sequelize) => queryInterface.sequelize.transaction((t) => {
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

    const addTopics = queryInterface.bulkInsert(
      'topics',
      [TOPIC], { transaction: t },
    );

    const addProgram = queryInterface.bulkInsert(
      'programs', [PROGRAM],
      { transaction: t },
      {
        test_series: { type: new Sequelize.JSON() },
        milestone_review_rubric: { type: new Sequelize.JSON() },
      },
    );

    const addResource = queryInterface.bulkInsert(
      'resources', [RESOURCE],
      { transaction: t },
      {
        details: { type: new Sequelize.JSON() },
      },
    );

    const addResourceVisits = queryInterface.bulkInsert(
      'resource_visits', _.times(100, RESOURCE_VISITS),
      { transaction: t },
      {
        details: { type: new Sequelize.JSON() },
      },
    );

    return Promise.all([
      addMilestones, addUser, addTopics, addProgram, addResource,
      addResourceVisits])
      .then(() => console.log('Seeded Resource Visits'))
      .catch(err => console.error(err));
  }),

  down: queryInterface => queryInterface.sequelize.transaction(t => Promise.all([
    queryInterface.bulkDelete('milestones', null, { transaction: t }),
    queryInterface.bulkDelete('resources', null, { transaction: t }),
    queryInterface.bulkDelete('programs', null, { transaction: t }),
    queryInterface.bulkDelete('topics', null, { transaction: t }),
    queryInterface.bulkDelete('users', null, { transaction: t }),
    queryInterface.bulkDelete('resource_visits', null, { transaction: t }),
  ])
    .then(() => console.log('milestones, programs, resources, topics, resource visits reverted.'))
    .catch(err => console.error(err))),
};

export default seeder;
