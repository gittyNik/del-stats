import Express from 'express';
import {
  getLearnerBreakouts,
  getUpcomingBreakouts,
  createLearnerBreakout,
  getLearnerBreakoutsByBreakoutId,
  markAttendance,
  learnerBreakoutsCreate,
  getLearnerBreakoutsByUserId,
} from '../../controllers/learning/learner_breakout.controller';
import {
  getAllCohortBreakouts,
  getBreakoutsForCohortMilestone,
  updateSanboxDetails,
  validateAttendanceForBreakout,
  createUpdateCohortBreakout,
  autoMarkBreakoutAttendance,
  markCompleteBreakout,
  sendDuplicateBreakouts,
} from '../../controllers/learning/breakout.controller';

import { allowMultipleRoles } from '../../controllers/auth/roles.controller';
import { USER_ROLES } from '../../models/user';

const {
  ADMIN, SUPERADMIN, CATALYST, EDUCATOR, REVIEWER,
} = USER_ROLES;

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
 * @api {get} /learning/ops/breakouts/cohort_breakout/:cohort_breakout_id Get all learner
 * breakouts for cohort breakout
 * @apiDescription get all learner breakouts for cohort breakout
 * @apiHeader {String} authorization JWT Token.
 * @apiName GetBreakouts
 * @apiGroup Breakouts
 */
router.get('/cohort_breakout/:cohort_breakout_id', getLearnerBreakoutsByBreakoutId);

/**
 * @api {get} /learning/ops/breakouts/upcoming Get all upcoming Breakouts
 * @apiDescription get all upcoming Breakouts
 * @apiHeader {String} authorization JWT Token.
 * @apiName GetBreakouts
 * @apiGroup Breakouts
 */
router.get('/upcoming', getUpcomingBreakouts);

/**
 * @api {get} /learning/ops/breakouts/:cohort_id/all Get all Cohort breakouts in a Cohort
 * @apiDescription get all cohort breakouts scheduled for a cohort
 * @apiHeader GetBreakouts
 * @apiGroup Breakouts
 */
router.get('/:cohort_id/all', getAllCohortBreakouts);

/**
 * @api {get} /learning/ops/breakouts/:cohort_id/:milestone_id/all Get all breakouts
 *  in Cohort Milestone.
 * @apiDescription get all Cohort Breakouts scheduled in a milestone in cohort.
 * @apiHeader GetBreakouts
 * @apiGroup Breakouts
 */
router.get('/:cohort_id/:milestone_id/all', getBreakoutsForCohortMilestone);

/**
 * @api {get} /learning/ops/breakouts/learner/:id Get all learner
 * breakouts for cohort breakout
 * @apiDescription get all learner breakouts for cohort breakout
 * @apiHeader {String} authorization JWT Token.
 * @apiName GetBreakouts
 * @apiGroup Breakouts
 */
router.get('/learner/:learner_id', getLearnerBreakoutsByUserId);

router.use(allowMultipleRoles([ADMIN, SUPERADMIN, CATALYST, EDUCATOR, REVIEWER]));

/**
 * @api {get} /learning/ops/breakouts/:id/sandbox Update Sandbox details
 * @apiHeader {String} authorization JWT Token.
 * @apiName UpdateBreakoutSandbox
 * @apiGroup CohortBreakout
 */
router.patch('/:id/sandbox', updateSanboxDetails);

/**
 * @api {get} /learning/ops/breakouts/:id/attendance Update Sandbox details
 * @apiHeader {String} authorization JWT Token.
 * @apiName ValidateBreakoutLearners
 * @apiGroup CohortBreakout
 */
router.get('/:id/attendance', validateAttendanceForBreakout);

/**
 * @api {get} /learning/ops/breakouts/duplicates/:days Update Sandbox details
 * @apiHeader {String} authorization JWT Token.
 * @apiName ValidateBreakoutLearners
 * @apiGroup CohortBreakout
 */
router.get('/duplicates/:days', sendDuplicateBreakouts);

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
 * @api {get} /learning/ops/breakouts/learner Create Learner breakouts for a cohort
 * @apiDescription Create learner breakouts for cohort
 * @apiHeader {String} authorization JWT Token.
 * @apiName CreateBreakouts
 * @apiGroup Breakouts
 *
 *  @apiParam {String} cohort_id Id of Cohort
 * @apiParam {String} learner_id Id of learner
 */
router.post('/learner', learnerBreakoutsCreate);

/**
 * @api {patch} /learning/ops/breakouts/breakout Schedule a Breakout for Cohort
 * @apiHeader {String} authorization JWT Token.
 * @apiName ScheduleBreakouts
 * @apiGroup Cohort
 */
router.post('/breakout', createUpdateCohortBreakout);

/**
 * @api {post} /learning/ops/breakouts/autoattendance/:breakout_id/:catalyst_id Auto mark attendance for a Breakout
 * @apiHeader {String} authorization JWT Token.
 * @apiName ScheduleBreakouts
 * @apiGroup CohortBreakouts
 */
router.get('/autoattendance/:breakout_id/:catalyst_id', autoMarkBreakoutAttendance);

/**
 * @api {post} /learning/ops/breakouts/finished Schedule a Breakout for Cohort
 * @apiHeader {String} authorization JWT Token.
 * @apiName ScheduleBreakouts
 * @apiGroup Cohort
 */
router.post('/finished', markCompleteBreakout);

/**
 * @api {get} /learning/ops/breakouts/mark_attendance Mark attendance of the breakout
 * @apiDescription Mark attendance of the breakout
 * @apiHeader {String} authorization JWT Token.
 * @apiName UpdateBreakouts
 * @apiGroup Breakouts
 */
router.post('/mark_attendance', markAttendance);

export default router;
