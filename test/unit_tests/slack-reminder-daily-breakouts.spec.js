import db from '../../src/database';
import Sequelize from 'sequelize';
import { getLiveCohorts } from '../../src/models/cohort';
import CohortBreakout, { getTodaysCohortBreakouts } from '../../src/models/cohort_breakout';
import _ from 'lodash';
import { getTopicNameById } from '../../src/models/topic';
import { postTodaysBreakouts } from '../../src/integrations/slack/delta-app/controllers/web.controller';
import { getSlackIdForLearner } from '../../src/models/slack_channels';


describe('Should get payload for daily slack reminder', () => {
  beforeAll(() => {
    return db
      .authenticate()
      .then(async () => {
        const res = await db.query('SELECT current_database()');
        console.log(`DB connected: ${res[0][0].current_database}`);
      });
  });

  afterAll(async (done) => {
    await db.close();
    done();
  });

  describe('Main route', () => {
    test('should return the final object', async () => {
      const res = await getTodaysCohortBreakouts();
      console.log(res);
      expect(res).toBeDefined();
    });

    test.only('Get payload and post the daily slack Reminder', async () => {
      const payload = await getTodaysCohortBreakouts();

      const res = await postTodaysBreakouts(payload);
      // const payload = await CohortBreakout.findAll({ where: { id: 'fc45f6d4-d7d0-4552-b671-0e4ff72d9ad2' } })
      console.log(JSON.stringify(payload, null, 2));
      console.log(res);
      expect(payload).toBeDefined();
      expect(res).toBeDefined();
    })
  });

  describe('testing seperately', () => {
    test('Get live cohorts', async () => {
      const liveCohorts = await getLiveCohorts();
      console.log(liveCohorts);
      expect(liveCohorts).toBeDefined();
    })

    test('should get live cohortMilestones', async () => {
      // const cohort_id = '033a02ae-1493-4397-a71e-050f0892c686';
      const cohort_id = '45b63d0e-60f4-4bb7-9818-cea3d6c98a6e';
      const TODAY_START = new Date().setHours(0, 0, 0, 0);
      const TOMORROW_START = new Date(TODAY_START + 24 * 60 * 60 * 1000);
      const res = await CohortBreakout.findAll({
        // where: Sequelize.where(Sequelize.fn('CURRENT_DATE'): {
        //   [Sequelize.Op.eq]: Sequelize.fn('date_trunc', 'day', Sequelize.col('time_scheduled'))
        // })
        // Sequelize.fn('date_trunc', 'day', Sequelize.literal('NOW()'))

        where: {
          // cohort_id,
          time_scheduled: {
            [Sequelize.Op.gt]: TODAY_START,
            [Sequelize.Op.lt]: TOMORROW_START
          }
        },
        raw: true
      })
      // res.map(breakout => {
      //   console.log(`Type: ${breakout.type} and Topics: ${breakout.details.topics}`);

      // })
      console.log(res.length);
      console.log(res[0]);
      console.log(new Date(res[0].time_scheduled).getHours());
      // const groupby = _.groupBy(res, res => res.cohort_id);

      // // console.log(groupby);
      // for (let cohort_id of Object.keys(groupby)) {
      //   // console.log(cohort_id);
      //   groupby[cohort_id] = _.groupBy(groupby[cohort_id], iter => iter.type);
      //   // console.log(groupby[cohort_id]);
      // }
      // console.log(groupby);

      expect(res).toBeDefined();
    });

    test('get topic name ', async () => {
      // const slackID = 'G018GBH1NSG';
      const topic_id = '89ac075c-c6c9-430d-97bf-b48f1d973272';
      const topic_name = await getTopicNameById(topic_id);
      console.log(topic_name);
      expect(topic_name).toBeDefined();
    })

    test('post message on slack', async () => {
      const res = await postTodaysBreakouts();
      console.log(res);
      expect(res).toBeDefined();
    })
  })
});
