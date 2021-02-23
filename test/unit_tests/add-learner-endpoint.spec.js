import db from '../../src/database';
import { getLiveCohortMilestone } from '../../src/models/cohort_milestone';
import { getCohortBreakoutsBetweenDates } from '../../src/models/cohort_breakout';
import { findOneCohort, getCohortFromId, addLearner } from '../../src/models/cohort';
import { addLearnersToCohortChannel } from '../../src/models/slack_channels';
import { addLearnerToGithubTeam } from '../../src/integrations/github/controllers';
import { teamNameFormat } from '../../src/integrations/github/controllers/teams.controller';
import { createLearnerBreakoutsForCurrentMS } from '../../src/models/learner_breakout';
import logger from '../../src/util/logger';
describe('Testing Add learner controller', () => {
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

  describe('add Learner', () => {
    // Ursa-online-pt
    const cohort_id = 'c4b75e2c-ac1e-47c4-a669-e202272fafaa';

    test('getLiveCohortMilestone', async () => {
      const cohort_milestone = await getLiveCohortMilestone(cohort_id);
      logger.info(cohort_milestone);
      expect(cohort_milestone).toBeDefined();
    });

    test('getCohortBreakoutsBetweenDates', async () => {
      const cohort_milestone = await getLiveCohortMilestone(cohort_id);
      const { release_time, review_scheduled } = cohort_milestone;
      const cohort_breakouts = await getCohortBreakoutsBetweenDates(cohort_id, release_time, review_scheduled);
      logger.info(cohort_breakouts);
      expect(cohort_breakouts).toBeDefined();
    })
    test('addLearnerToCohort', async () => {
      const learners = ['46c721b0-3a0a-487a-bc69-bc39311b7f7c'];
      const addLearners = await addLearnersToCohortChannel(cohort_id, learners);
      logger.info(addLearners);
      expect(addLearners).toBeDefined();
    });

    test('get cohort', async () => {
      const cohort = await findOneCohort({ id: cohort_id }).map(el => el.get({ plain: true }));
      // .then(d => d.get({ plain: true }));
      logger.info(cohort);
      expect(cohort).toBeDefined();
    })

    test('addLearnerToGithubTeam', async () => {
      const learner_id = '46c721b0-3a0a-487a-bc69-bc39311b7f7c';
      const githubResponse = await addLearnerToGithubTeam(learner_id, cohort_id);
      logger.info(githubResponse);
      expect(githubResponse).toBeDefined();
    })

    test('get github team name format', async () => {
      const cohort = await getCohortFromId(cohort_id);
      const teamName = teamNameFormat(
        cohort.name,
        cohort.program_id,
        cohort.location,
        cohort.start_date,
        cohort.duration
      );
      logger.info(teamName);
      expect(teamName).toBeDefined();
    });

    test('createLearnerBreakoutsForCurrentMS', async () => {
      const learner_id = '';
      let cohort_milestone = await getLiveCohortMilestone(cohort_id);
      let cohort_breakouts = await getCohortBreakoutsBetweenDates(cohort_id,
        cohort_milestone.release_time, cohort_milestone.review_scheduled);
      const lbs = await createLearnerBreakoutsForCurrentMS(learner_id, cohort_breakouts);
      logger.info(lbs);
      expect(lbs).toBeDefined();
    })

    test('addLearnersToCohortChannel', async () => {

    })
  });

  describe('Whole route', () => {
    test.only('should add Learner', async () => {
      const learners = ['d4c4b39b-c482-45de-8f4f-a4a1aa6f9930'];
      const cohort_id = 'c4b75e2c-ac1e-47c4-a669-e202272fafaa';

      const addlearners = await addLearner(learners, cohort_id);
      logger.info(addlearners);
      expect(addlearners).toBeDefined();
    }, 60000);
  });
});
