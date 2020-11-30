import uuid from 'uuid/v4';
import faker from 'faker';
import _ from 'lodash';
import { randomNum, generateUuids, cleanJSON } from '../../src/util/seederUtils';

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

const TAG = () => ({
  id: uuid(),
  tag_name: faker.random.word(),
  topic_id: TOPIC.id,
  add_time: new Date(),
  owner: uuid(),
  moderator: generateUuids(),
  description: faker.lorem.sentence(),
  source: faker.internet.domainName(), // slack/web
  details: cleanJSON({
    description: faker.lorem.sentence(),
    source: faker.name.firstName(),
  }),
  parent_tags: generateUuids(),
  child_tags: generateUuids(),
  similar_tags: generateUuids(),
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

    const addTag = queryInterface.bulkInsert(
      'tags',
      _.times(10, TAG), { transaction: t },
      { details: { type: new Sequelize.JSON() } },
    );

    return Promise.all([addMilestones, addTopics, addTag])
      .then(() => console.log('Seeded Tags'))
      .catch(err => console.error(err));
  }),

  down: async queryInterface => queryInterface.sequelize.transaction(t => Promise.all([
    queryInterface.bulkDelete('milestones', null, { transaction: t }),
    queryInterface.bulkDelete('topics', null, { transaction: t }),
    queryInterface.bulkDelete('tags', null, { transaction: t }),
  ])
    .then(() => console.log('milestones, topics and tags reverted'))
    .catch(err => console.error(err))),
};
