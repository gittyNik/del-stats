import Express from 'express';
import { getLearnerBreakouts, getUpcomingBreakouts, createLearnerBreakout } from '../../controllers/learning/learner_breakout.controller';
import { getAllCohortBreakouts, getBreakoutsForCohortMilestone } from '../../controllers/learning/breakout.controller';

const router = Express.Router();

/**
 * @api {get} /learning/ops/breakouts Get all Breakouts attended by learnes
 * @apiDescription get all Breakouts attended by learnes
 * @apiHeader {String} authorization JWT Token.
 * @apiName GetBreakouts
 * @apiGroup Breakouts
 */
router.get('/', getLearnerBreakouts);

/**
 * @api {get} /learning/ops/breakouts/upcoming Get all upcoming Breakouts
 * @apiDescription get all upcoming Breakouts
 * @apiHeader {String} authorization JWT Token.
 * @apiName GetBreakouts
 * @apiGroup Breakouts
 */
router.get('/upcoming', getUpcomingBreakouts);


/**
 * @api {post} /learning/ops/breakouts Submit a Breakout
 * @apiDescription Submit a Breakout that the learner has attended
 * @apiHeader {String} authorization JWT Token.
 * @apiName AddBreakout
 * @apiGroup Breakout
 *
 * @apiParam {String} cohort_breakout_id Id of Cohort Breakout
 * @apiParam {String} learner_id Id of learner
 * @apiParam {String} learner_notes Learner notes
 * @apiParam {String} learner_feedback Learner feedback on Breakout
 */
router.post('/', createLearnerBreakout);


/**
 * @api {get} /learning/ops/breakouts/:cohort_id/all Get all Cohort breakouts in a Cohort
 * @apiDescription get all cohort breakouts scheduled for a cohort
 * @apiHeader GetBreakouts
 * @apiGroup Breakouts
 */
router.get('/:cohort_id/all', getAllCohortBreakouts);

/**
 * @api {get} /learning/ops/breakouts/:cohort_id/:milestone_id/all Get all breakouts in Cohort Milestone.
 * @apiDescription get all Cohort Breakouts scheduled in a milestone in cohort.
 * @apiHeader GetBreakouts
 * @apiGroup Breakouts
 */
router.get('/:cohort_id/:milestone_id/all', getBreakoutsForCohortMilestone);

export default router;
