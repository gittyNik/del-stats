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

const CHALLENGE_DIFFICULTY = ['easy', 'medium', 'difficult'];
const CHALLENGE_SIZE = ['tiny', 'small', 'large'];

const CHALLENGE = () => ({
  id: uuid(),
  topic_id: TOPIC.id,
  title: faker.lorem.sentence(),
  description: faker.lorem.sentence(),
  starter_repo: faker.internet.domainName(),
  difficulty: _.sample(...CHALLENGE_DIFFICULTY),
  size: _.sample(...CHALLENGE_SIZE),
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

    const addChallenges = queryInterface.bulkInsert(
      'topics',
      _.times(100, CHALLENGE), { transaction: t },
    );

    return Promise.all([addMilestones, addTopics, addChallenges])
      .then(() => console.log('Seeded Challenges'))
      .catch(err => console.error(err));
  }),

  down: async queryInterface => queryInterface.sequelize.transaction(t => Promise.all([
    queryInterface.bulkDelete('milestones', null, { transaction: t }),
    queryInterface.bulkDelete('topics', null, { transaction: t }),
    queryInterface.bulkDelete('challenges', null, { transaction: t }),
  ])
    .then(() => console.log('milestones, topics and challenges reverted'))
    .catch(err => console.error(err))),
};
