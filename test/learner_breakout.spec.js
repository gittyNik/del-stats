import db from '../src/database';
import uuid from 'uuid/v4';
import { getCalendarDetailsOfCohortBreakout } from '../src/models/cohort_breakout'
import { getGoogleOauthOfUser, googleConfig } from '../src/util/calendar-util';
import { LearnerBreakout, } from '../src/models/learner_breakout';


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

});
