import Express from 'express';
import {
  getCohortByName, getCohorts, getCohort, createCohort, updateCohort,
  getUpcomingCohorts, deleteCohort, beginCohort, getCohortByLearnerId,
  createUpdateCohortBreakout,
} from '../../controllers/learning/cohort.controller';
import {
  createBreakouts, createSingleBreakout,
  updateZoomMeeting, updateCohortBreakout,
} from '../../controllers/learning/breakout.controller';
import { allowSuperAdminOnly } from '../../controllers/auth/roles.controller';

const router = Express.Router();

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
 * @api {patch} /cohorts/:id Update a cohort
 * @apiHeader {String} authorization JWT Token.
 * @apiName UpdateCohort
 * @apiGroup Cohort
 */
router.patch('/:id', updateCohort);

/**
 * @api {patch} /cohorts/schedule Schedule Breakouts for Cohorts
 * @apiHeader {String} authorization JWT Token.
 * @apiName ScheduleBreakouts
 * @apiGroup Cohort
 */
router.post('/schedule', createBreakouts);

/**
 * @api {patch} /cohorts/:id/breakout Schedule a Single Breakout for Cohort with Learners Breakouts
 * @apiHeader {String} authorization JWT Token.
 * @apiName ScheduleBreakouts
 * @apiGroup Cohort
 */
router.post('/:id/breakout', createSingleBreakout);

/**
 * @api {patch} /cohorts/breakout Schedule a Breakout for Cohort
 * @apiHeader {String} authorization JWT Token.
 * @apiName ScheduleBreakouts
 * @apiGroup Cohort
 */
router.post('/breakout', createUpdateCohortBreakout);


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
