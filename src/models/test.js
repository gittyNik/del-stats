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
  where: { application_id },
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


export default Test;
