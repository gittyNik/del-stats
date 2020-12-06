import Express from 'express';
import { CodeGuruReviewer } from 'aws-sdk';
import {
  getCohortByName,
  getCohorts,
  getCohort,
  createCohort,
  updateCohort,
  getUpcomingCohorts,
  deleteCohort,
  beginCohort,
  getCohortByLearnerId,
  createUpdateCohortBreakout,
  moveLearnertoDifferentCohortEndpoint,
  markCompleteBreakout,
  removeLearnerEndpoint,
  addLearnerEndpoint,
  beginParallelCohort,
  liveCohorts,
  autoMarkBreakoutAttendance,
} from '../../controllers/learning/cohort.controller';
import {
  createBreakouts,
  createSingleBreakout,
  updateZoomMeeting,
  updateCohortBreakout,
  updateMilestonesBreakoutTimelines,
  createBreakoutsOfType,
  createCohortMilestoneLearnerBreakouts,
} from '../../controllers/learning/breakout.controller';
import {
  allowSuperAdminOnly,
  allowMultipleRoles,
} from '../../controllers/auth/roles.controller';
import { USER_ROLES } from '../../models/user';

const {
  ADMIN, CATALYST, EDUCATOR,
  REVIEWER,
} = USER_ROLES;

const router = Express.Router();

// router.patch('/movelearner', moveLearnertoDifferentCohortEndpoint);
/**
 * @api {get} /cohorts Get all cohorts
 * @apiHeader {String} authorization JWT Token.
 * @apiName GetCohorts
 * @apiGroup Cohort
 */
router.get('/', getCohorts);

/**
 * @api {get} /cohorts/upcoming Get upcoming cohorts
 * @apiHeader {String} authorization JWT Token.
 * @apiName GetUpcomingCohorts
 * @apiGroup Cohort
 */
router.get('/upcoming', getUpcomingCohorts);

/**
 * @api {get} /cohorts/live Get live Cohorts
 * @apiHeader {String} authorization JWT Token.
 * @apiName LiveCohorts
 * @apiGroup Cohort
 */
router.get('/live', liveCohorts);

/**
 * @api {get} /cohorts/:id Get a cohort by id
 * @apiHeader {String} authorization JWT Token.
 * @apiName GetCohort
 * @apiGroup Cohort
 */
router.get('/:id', getCohort);

/**
 * @api {get} /cohorts/:year/:location/:name Get a cohort with name
 * @apiHeader {String} authorization JWT Token.
 * @apiName GetCohortByName
 * @apiGroup Cohort
 */
router.get('/:year/:location/:name', getCohortByName);

/**
 * @api {get} /cohorts/user/:id Get a cohort by user id
 * @apiHeader {String} authorization JWT Token.
 * @apiName GetCohotByUserId
 * @apiGroup Cohort
 */
router.get('/user/:id', getCohortByLearnerId);

/**
 * @api {get} /cohorts/milestone/:id Get a cohort milestone topics
 * @apiHeader {String} authorization JWT Token.
 * @apiName GetCohotMilestoneTopics
 * @apiGroup Cohort
 */
router.get('/milestone/:id', createCohortMilestoneLearnerBreakouts);

router.use(allowMultipleRoles([ADMIN, CATALYST, EDUCATOR, REVIEWER]));

/**
 * @api {post} /cohorts/addLearner Add learner to a new cohort
 * @apiHeader {String} authorization JWT Token.
 * @apiName addLearnerToCohort
 * @apiGroup Cohort
 */
router.post('/addLearner', addLearnerEndpoint);

/**
 * @api {patch} /cohorts/movelearner move learner to a new cohort
 * @apiHeader {String} authorization JWT Token.
 * @apiName changeLearnerBreakout
 * @apiGroup Cohort
 */
router.patch('/movelearner', moveLearnertoDifferentCohortEndpoint);

/**
 * @api {patch} /cohorts/removelearner remove learner from a cohort
 * @apiHeader {String} authorization JWT Token.
 * @apiName changeLearnerBreakout
 * @apiGroup Cohort
 */
router.delete('/removeLearner', removeLearnerEndpoint);

// Restrict modifications for any applicant to the cohorts
router.use(allowSuperAdminOnly);

/**
 * @api {post} /cohorts Create a cohort
 * @apiHeader {String} authorization JWT Token.
 * @apiName CreateCohort
 * @apiGroup Cohort
 */
router.post('/', createCohort);

/**
 * @api {patch} /cohorts/:id/begin Mark beginning of a cohort
 * @apiHeader {String} authorization JWT Token.
 * @apiName BeginCohort
 * @apiGroup Cohort
 */
router.patch('/:id/begin', beginCohort);

/**
 * @api {patch} /cohorts/:id/begin Mark beginning of a cohort
 * @apiHeader {String} authorization JWT Token.
 * @apiName BeginCohort
 * @apiGroup Cohort
 */
router.patch('/begin', beginParallelCohort);

/**
 * @api {patch} /cohorts/:id Update a cohort
 * @apiHeader {String} authorization JWT Token.
 * @apiName UpdateCohort
 * @apiGroup Cohort
 */
router.patch('/:id', updateCohort);

/**
 * @api {patch} /cohorts/:id/milestones Update cohort milestone and breakouts
 * @apiHeader {String} authorization JWT Token.
 * @apiName UpdateCohortMilestoneBreakouts
 * @apiGroup Cohort
 */
router.patch('/:id/milestones', updateMilestonesBreakoutTimelines);

/**
 * @api {patch} /cohorts/schedule Schedule Breakouts for Cohorts
 * @apiHeader {String} authorization JWT Token.
 * @apiName ScheduleBreakouts
 * @apiGroup Cohort
 */
router.post('/schedule', createBreakouts);

/**
 * @api {patch} /cohorts/schedule Schedule Breakouts for Cohorts
 * @apiHeader {String} authorization JWT Token.
 * @apiName ScheduleBreakouts
 * @apiGroup Cohort
 */
router.post('/schedule-breakout-type', createBreakoutsOfType);

/**
 * @api {patch} /cohorts/:id/breakout Schedule a Single Breakout for Cohort with Learners Breakouts
 * @apiHeader {String} authorization JWT Token.
 * @apiName ScheduleBreakouts
 * @apiGroup Cohort
 */
router.post('/:id/breakout', createSingleBreakout);

/**
 * @api {patch} /cohorts/breakout/:id Update Cohort Breakout Time
 * @apiHeader {String} authorization JWT Token.
 * @apiName UpdateBreakout
 * @apiGroup CohortBreakout
 */
router.patch('/breakout/:id', updateCohortBreakout);

/**
 * @api {delete} /cohorts/:id Delete a cohort
 * @apiHeader {String} authorization JWT Token.
 * @apiName DeleteCohort
 * @apiGroup Cohort
 */
router.delete('/:id', deleteCohort);

// TODO: Move zoom meeting to separate route
/**
 * @api {patch} /cohorts/zoom/:id Update a cohort
 * @apiHeader {String} authorization JWT Token.
 * @apiName UpdateZoom
 * @apiGroup Zoom
 */
router.patch('/zoom/:id', updateZoomMeeting);

export default router;
