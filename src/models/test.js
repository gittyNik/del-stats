import Sequelize from 'sequelize';
import db from '../database';

// TODO: enforce sub_time > start_time
export const Test = db.define('tests', {
  id: {
    type: Sequelize.UUID,
    primaryKey: true,
  },
  application_id: {
    type: Sequelize.UUID,
    allowNull: false,
  },
  purpose: Sequelize.STRING,
  duration: Sequelize.INTEGER,
  responses: {
    type: Sequelize.ARRAY(Sequelize.JSON),
    allowNull: false,
  },
  start_time: Sequelize.DATE,
  sub_time: Sequelize.DATE,
  browser_history: Sequelize.ARRAY(Sequelize.UUID),
  created_at: {
    allowNull: false,
    type: Sequelize.DATE,
  },
  updated_at: {
    allowNull: false,
    type: Sequelize.DATE,
  },
});

// fetch all tests from the same application which are not submitted yet
export const getTestsOfSameApplication = (id) => db.query('select * from tests where application_id in (select application_id from tests where id=:id) and sub_time is not null', {
  replacements: { id },
  model: Test,
});

export const getUnsubmittedTestsOfApplication = (application_id) => Test.findAll({
  attributes: ['id', 'duration', 'purpose', 'start_time'],
  where: {
    application_id,
    sub_time: null,
  },
});

// Allow submit only if it wasn't submitted before and started already
// returns undefined if submission was not possible
export const setSubmitTimeNow = (id) => Test.update({
  sub_time: Sequelize.literal('now()'),
}, {
  where: {
    id,
    sub_time: null,
    start_time: {
      [Sequelize.Op.ne]: null,
    },
  },
  returning: true,
  raw: true,
})
  .then(results => results[1][0]); // returns the test data

export const getSubmissionTimes = () => db.query('select purpose, count(application_id), avg(extract(epoch from sub_time) - extract(epoch from start_time)) as avg_time, avg(duration) as max_time from tests where start_time is not null and sub_time is not null group by purpose;')
  .then(result => result[0])
  .then(durations => {
    const total_avg_time = durations.reduce((acc, el) => (acc + el.avg_time), 0);
    return { total_avg_time, durations };
  });

export const getSubmissionTimesByApplication = (application_id) => db.query('select purpose, count(application_id), avg(extract(epoch from sub_time) - extract(epoch from start_time)) as avg_time, avg(duration) as max_time from tests where start_time is not null and sub_time is not null and application_id=? group by purpose;', {
  replacements: [application_id],
})
  .then(result => result[0])
  .then(durations => {
    const total_avg_time = durations.reduce((acc, el) => (acc + el.avg_time), 0);
    return { total_avg_time, durations };
  })
  .then(current => getSubmissionTimes()
    .then(total => ({
      current,
      total,
    })));
