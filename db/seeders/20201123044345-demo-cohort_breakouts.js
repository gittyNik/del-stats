import uuid from 'uuid/v4';
import faker from 'faker';
import _ from 'lodash';
import { compatibleArray, randomNum, cleanJSON } from '../../src/util/seederUtils';

const EVENT_STATUS = [
  'scheduled',
  'started',
  'cancelled',
  'aborted',
  'running',
  'completed',
  'review-shared',
];
const BREAKOUT_TYPE = [
  'lecture',
  'codealong',
  'questionhour',
  'activity',
  'groupdiscussion',
  'reviews',
  'assessment',
  '1on1',
];

module.exports = {
  up: (queryInterface, Sequelize) => queryInterface.sequelize.transaction(async (t) => {

    const catalysts = await queryInterface.sequelize.query(
      `SELECT id from users
      WHERE role='catalyst';`,
    );

    const topics = await queryInterface.sequelize.query(
      `SELECT id from topics;`
    );

    const breakout_templates = await queryInterface.sequelize.query(
      `SELECT id from breakout_templates;`
    );

    const cohorts = await queryInterface.sequelize.query(
      `SELECT id from cohorts;`
    );

    // catalyst, updated_by not mapped users
    const COHORT_BREAKOUTS = () => ({
      id: uuid(),
      type: _.sample(BREAKOUT_TYPE),
      breakout_template_id: _.sample((breakout_templates[0])).id,
      domain: faker.internet.domainName(),
      topic_id: _.sample((topics[0])).id,
      cohort_id: _.sample((cohorts[0])).id,
      time_scheduled: new Date(),
      duration: 1800000 * 2,
      location: faker.address.city(),
      catalyst_id: _.sample((catalysts[0])).id,
      status: _.sample(EVENT_STATUS),
      catalyst_notes: faker.lorem.sentence(),
      catalyst_feedback: faker.lorem.sentence(),
      attendance_count: randomNum(200),
      created_at: new Date(),
      updated_at: new Date(),
      updated_by: compatibleArray([_.sample((catalysts[0])).id]),
      time_taken_by_catalyst: randomNum(200),
      time_started: new Date(),
      team_feedback: cleanJSON({
        details: faker.lorem.sentences(),
        marks: randomNum(100),
      }),
      details: cleanJSON({
        description: faker.lorem.paragraph(),
        source: faker.internet.domainName(),
      }),
    });

    return queryInterface.bulkInsert('cohort_breakouts',
      _.times(100, COHORT_BREAKOUTS),
      { transaction: t },
      {
        team_feedback: { type: new Sequelize.JSON() },
        details: { type: new Sequelize.JSON() },
      })
      .then(() => console.log('seeded cohort_breakouts'))
      .catch(err => console.log(err));
  }),

  down: async queryInterface => queryInterface.sequelize.transaction(t => Promise.all([
    queryInterface.bulkDelete('cohort_breakouts', null, { transaction: t }),
  ])
    .then(() => console.log('cohort_breakouts reverted'))
    .catch(err => console.error(err))),
};
