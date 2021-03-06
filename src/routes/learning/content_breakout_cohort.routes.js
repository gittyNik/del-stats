import Express from 'express';
import {
  getBreakouts, createBreakout,
  updateBreakout, deleteBreakout, getLiveCohortsBreakouts,
} from '../../controllers/learning/breakout.controller';
import { allowMultipleRoles, allowAdminsOnly } from '../../controllers/auth/roles.controller';
import { USER_ROLES } from '../../models/user';

const {
  ADMIN, CATALYST, EDUCATOR, REVIEWER, OPERATIONS,
} = USER_ROLES;

const router = Express.Router();

router.use(allowMultipleRoles([ADMIN, CATALYST, EDUCATOR, REVIEWER, OPERATIONS]));

/**
 * @api {get} /learning/content/breakouts/cohort Get all Content Breakouts
 * @apiDescription get all Content Breakouts
 * @apiHeader {String} authorization JWT Token.
 * @apiName GetContentBreakouts
 * @apiGroup ContentBreakouts
 */
router.get('/', getBreakouts);

/**
 * @api {get} /learning/content/breakouts/cohort Get all live cohorts Content Breakouts
 * @apiDescription get all live cohorts Content Breakouts
 * @apiHeader {String} authorization JWT Token.
 * @apiName GetLiveCohortsContentBreakouts
 * @apiGroup ContentBreakouts
 */
router.get('/live_cohorts', getLiveCohortsBreakouts);

// Restrict modifications for any applicant to the cohorts
router.use(allowAdminsOnly);

/**
 * @api {post} /learning/content/breakouts/cohort Add Content Breakout
 * @apiDescription Add a Content Breakout
 * @apiHeader {String} authorization JWT Token.
 * @apiName AddContentBreakout
 * @apiGroup ContentBreakout
 *
 * @apiParam {String="lecture","codealong",
 * "questionhour","activity","groupdiscussion"} type Type of Breakout
 * @apiParam {String} domain Domain of the Breakout
 * @apiParam {String} topic_id Id of the topic for Breakout
 * @apiParam {String} cohort_id Id of the Cohort
 * @apiParam {Object} time_scheduled Scheduled time for the Breakout
 * @apiParam {Number} duration Duration of the Breakout
 * @apiParam {String} location location of the Breakout
 * @apiParam {String} catalyst_id Id of the Catalyst
 * @apiParam {String="scheduled","started","cancelled",
 *  "aborted","running","completed"} status Status of Breakout
 * @apiParam {String} catalyst_notes Catalyst Note
 * @apiParam {String} catalyst_feedback Feedback by Catalyst
 * @apiParam {Number} attendance_count Total attendence for the Breakout
 */
router.post('/', createBreakout);

/**
 * @api {patch} /learning/content/breakouts/cohort/:id  Update Content Breakout
 * @apiDescription Update a Content Breakout
 * @apiHeader {String} authorization JWT Token.
 * @apiName UpdateContentBreakout
 * @apiGroup ContentBreakout
 *
 * @apiParam {String="lecture","codealong","questionhour",
*  "activity","groupdiscussion"} type Type of Breakout
 * @apiParam {String} domain Domain of the Breakout
 * @apiParam {String} topic_id Id of the topic for Breakout
 * @apiParam {String} cohort_id Id of the Cohort
 * @apiParam {Object} time_scheduled Scheduled time for the Breakout
 * @apiParam {Number} duration Duration of the Breakout
 * @apiParam {String} location location of the Breakout
 * @apiParam {String} catalyst_id Id of the Catalyst
 * @apiParam {String="scheduled","started",
 * "cancelled","aborted","running","completed"} status Status of Breakout
 * @apiParam {String} catalyst_notes Catalyst Note
 * @apiParam {String} catalyst_feedback Feedback by Catalyst
 * @apiParam {Number} attendance_count Total attendence for the Breakout
 */
router.patch('/:id', updateBreakout);

/**
 * @api {delete} /learning/content/breakouts/cohort/:id Delete Content Breakout
 * @apiDescription Delete a Content Breakout
 * @apiHeader {String} authorization JWT Token.
 * @apiName DeleteContentBreakout
 * @apiGroup ContentBreakout
 */
router.delete('/:id', deleteBreakout);

export default router;
