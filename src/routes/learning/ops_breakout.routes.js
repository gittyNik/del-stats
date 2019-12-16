import Express from 'express';
import { getLearnerBreakouts, getUpcomingBreakouts, createLearnerBreakout } from '../../controllers/learning/learner_breakout.controller';

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

export default router;
