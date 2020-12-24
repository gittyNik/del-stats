import Sequelize from 'sequelize';
// import app from '../src/server';
import models from '../src/models';
// import request from 'supertest';
// import superagent from 'superagent';
import db from '../src/database';
import { updateVideoMeeting } from '../src/models/video_meeting';
import { CohortBreakout } from '../src/models/cohort_breakout';
import logger from '../src/util/logger';


const { PORT } = process.env;

describe('Testing Zoom Meetings', () => {
  // const sequelize = new Sequelize(dbConfig.test);

  beforeAll(() => {
    // connect database.
    return db
      .authenticate()
      .then(() => {
        logger.info('Connection has established.');
        // return app.listen(PORT, err => {
        //   if (!err) {
        //     logger.info(`Server is running on port: ${PORT}`);
        //   }
        // });
      })
      .catch(err => {
        logger.info('Unable to establish connection', err);
      });
  });

  afterAll(async (done) => {
    // disconnect database.
    db.close();
    done();

  });

  test('Date time JS', () => {
    const now = new Date();
    logger.info(now.toISOString());
    logger.info('time stamp: ', now.getTime());
    // logger.info(now.valueOf());
    // let week = [now.getDate()]
    // let future = new Date(2020, 3, 3, 22, 30, 0);
    let future = new Date('2020-04-03T22:30:00.000Z')

    logger.info(future.toISOString());
    logger.info(future.getTime());
    // expect(future.previous(time_scheduled)).toBe(now)
    expect(future.toISOString()).not.toBe(now.toISOString());
  });

  test(' Updating time_scheduled of cohort_breakout by 1 min.', async () => {
    const cohort_breakout_id = ''; // enter cohort_breakout_id to test.

    const cohort_breakout = await CohortBreakout.findByPk(cohort_breakout_id);
    logger.info(cohort_breakout.toJSON());
    let { time_scheduled, details } = cohort_breakout.toJSON();
    let oldTime = new Date(time_scheduled);
    let newTime = new Date(oldTime.getTime() + 60 * 1000); // adding 1 min.
    logger.info(newTime);
    let res = await updateVideoMeeting(cohort_breakout_id, newTime.toISOString());
    logger.info(res);
    let updated_cb = await CohortBreakout.findByPk(cohort_breakout_id);
    // logger.info(updated_cb);
    // logger.info(cohort_breakout.previous('time_scheduled'));
    // expect(updated_cb.previous('time_scheduled')).toBe(time_scheduled);
    let utime_scheduled = updated_cb.get('time_scheduled');
    logger.info(utime_scheduled);
    logger.info(typeof utime_scheduled, typeof newTime);
    expect(utime_scheduled).not.toBe(time_scheduled);
    expect(utime_scheduled).toEqual(newTime);
  });
});





