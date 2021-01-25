import db from '../../src/database';
import '../../src/models';
import { getLearnerList } from '../../src/models/portfolio';
import { getReviewRubricForALearner } from '../../src/models/learner_breakout';
import { getMilestoneDetailsForReview } from '../../src/models/cohort_breakout';
import logger from '../../util/logger';

describe('should return a list of learners registered for placement drive', () => {
  beforeAll(() => {
    return db
      .authenticate()
      .then(async () => {
        const res = await db.query('SELECT current_database()');
        logger.info(`DB connected: ${res[0][0].current_database}`);
      });
  });

  afterAll(async (done) => {
    await db.close();
    done();
  });

  describe('get list of learners', () => {
    test('should return getLearnerList', async () => {
      const res = await getLearnerList();
      logger.info(res);
      expect(res).toBeDefined();
    });
  });

  describe('Get review rubric for a learner', () => {
    test.only('getReviewRubricForALearner', async () => {
      const learner_id = '18d61ecb-af60-4c16-9d28-3a24d1a3064f';
      const res = await getReviewRubricForALearner(learner_id);
      logger.info(JSON.stringify(res, null, 4));
      logger.info('=-------------------------------==---');
      logger.info(JSON.stringify(res[0], null, 4))
      expect(res).toBeDefined();
    });

    test.only('getMilestoneDetails', async () => {
      const cohort_breakout_id = 'ed8e1b79-e0b4-44c6-8c15-19c09f89e1f2';
      const res = await getMilestoneDetailsForReview(cohort_breakout_id);
      logger.info(JSON.stringify(res, null, 4));
      expect(res).toBeDefined();
    })
  })
});
