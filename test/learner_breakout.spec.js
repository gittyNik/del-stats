import db from '../src/database';
import uuid from 'uuid/v4';
import { getCalendarDetailsOfCohortBreakout } from '../src/models/cohort_breakout'
import { getGoogleOauthOfUser, googleConfig } from '../src/util/calendar-util';
import { LearnerBreakout, createCalendarEventsForLearner } from '../src/models/learner_breakout';


const createLearnerBreakout = (cohort_breakout_id, learner_id) => {
  return LearnerBreakout
    .create({
      id: uuid(),
      cohort_breakout_id,
      learner_id,
      attendance: false,
    })
    .then(data => data.get({ plain: true }))
    .then(data => {
      console.log(data);
      return data;
    })
    .catch(err => {
      console.error(err);
      return undefined;
    });
}

describe('Learner Breakout related tests', () => {
  beforeAll(() => {
    // connect database.
    return db
      .authenticate()
      .then(() => {
        console.log('Connection has established.');
        // return app.listen(PORT, err => {
        //   if (!err) {
        //     console.log(`Server is running on port: ${PORT}`);
        //   }
        // });
      })
      .catch(err => {
        console.log('Unable to establish connection', err);
      });
  });

  afterAll(async (done) => {
    // disconnect database.
    db.close();
    done();
  });

  test('Get details  for creating calendar from cohort_breakout ', async () => {

    // CB with objects as topic.
    const cohort_breakout_id = 'd063b5f0-dcfd-4e42-a52c-c0b86deee024';
    const res = await getCalendarDetailsOfCohortBreakout(cohort_breakout_id);
    console.log(res);
    expect(res).toBeDefined();
  });

  test('Get Oauth for a learner with refresh token', async () => {
    const user_id = '1253d564-b0a9-45b0-a54b-0b3f53febeab';
    const googleOauth = await getGoogleOauthOfUser(user_id);
    console.log(googleOauth);
    expect(googleOauth).toBeDefined;
  });

  test('testing createCalendarEvent hook for LearnerBreakout afterCreate.', async () => {
    const cohort_breakout_id = 'd063b5f0-dcfd-4e42-a52c-c0b86deee024';
    const learner_id = '1253d564-b0a9-45b0-a54b-0b3f53febeab';
    const learnerBreakout = await LearnerBreakout
      .create({
        id: uuid(),
        cohort_breakout_id,
        learner_id,
        attendance: false,
      })
      .then(data => data.get({ plain: true }))
      .then(data => {
        console.log(data);
        return data;
      })
      .catch(err => {
        console.error(err);
        return undefined;
      });
    expect(learnerBreakout).toBeDefined();

  });

  test('create learner Breakouts for all the cohort Breakouts', async () => {
    expect(1 + 2).toBe(3);
    const cohort_breakouts = [
      'b3fd4a6c-b205-4cc2-86a1-73bc07fd95e6',
      '618256d2-737f-4342-8208-ceaaae51a070',
      '83c0c81d-6068-480e-a007-4a732cb57e1c',
      'f3fe1b8b-4e50-46c9-9b18-c361a9c7881f',
      'a472d724-0903-421d-a002-f7cb7d457541',
      '5b4b7d70-8a9a-4f61-b20d-cd0a64f57e5d',
      'ec6b2519-3810-411d-b456-d2305612012b',
      '281d6690-2864-47f0-a020-9b3b7b06046b',
      'ad9fea5e-a398-4bbb-a512-eeec7796715f',
      'ab86d98e-ae50-40f4-b1e0-7a53c52a4700',
      '4a37e79c-0b7c-4fbb-9637-65d1f5b4e076',
      'a0845b56-2dd0-4da0-ae37-7f90fb6e6715',
      'c8624585-2c09-415e-8d09-968b405e6e26'
    ];

    console.log(cohort_breakouts.length);
    const learner_id = '1253d564-b0a9-45b0-a54b-0b3f53febeab';

    const lbs = await Promise.all(cohort_breakouts.map(async cb => {
      const lb = LearnerBreakout
        .create({
          id: uuid(),
          cohort_breakout_id: cb,
          learner_id,
          attendance: false,
        })
        .then(data => data.get({ plain: true }))
        .catch(err => {
          console.error(err);
          return null;
        });
      return lb;
    }))
    console.log(lbs);
    expect(lbs.length).toBe(cohort_breakouts.length);
  });

  test.only('Create calendar event for a learner Breakout', async () => {
    const learner_id = '1253d564-b0a9-45b0-a54b-0b3f53febeab';
    const res = await createCalendarEventsForLearner(learner_id);
    console.log(res);
    expect(res).toBeDefined();
  })

});
