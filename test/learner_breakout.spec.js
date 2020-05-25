import db from '../src/database';
import { getCalendarDetailsOfCohortBreakout } from '../src/models/cohort_breakout'
// import { LearnerBreakout, } from '../src/models/learner_breakout';

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
  })
});
