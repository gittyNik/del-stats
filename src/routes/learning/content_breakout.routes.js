import Express from 'express';
import {
  getBreakouts,
  createBreakout,
  updateBreakout,
  deleteBreakout,
} from '../../controllers/learning/breakout.controller';
// import { apiNotReady } from '../../controllers/api.controller';

const router = Express.Router();

/**
 * @api {get} /learning/content/breakouts Get all Content Breakouts
 * @apiDescription get all Content Breakouts
 * @apiHeader {String} authorization JWT Token.
 * @apiName GetContentBreakouts
 * @apiGroup ContentBreakouts
 */
router.get('/', getBreakouts);

/**
 * @api {post} /learning/content/breakouts/ Add Content Breakout
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
 *  "aborted","running"} status Status of Breakout
 * @apiParam {String} catalyst_notes Catalyst Note
 * @apiParam {String} catalyst_feedback Feedback by Catalyst
 * @apiParam {Number} attendance_count Total attendence for the Breakout
 */
router.post('/', createBreakout);

/**
 * @api {patch} /learning/content/breakouts/:id  Update Content Breakout
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
 * "cancelled","aborted","running"} status Status of Breakout
 * @apiParam {String} catalyst_notes Catalyst Note
 * @apiParam {String} catalyst_feedback Feedback by Catalyst
 * @apiParam {Number} attendance_count Total attendence for the Breakout
 */
router.patch('/:id', updateBreakout);

/**
 * @api {delete} /learning/content/breakouts/:id Delete Content Breakout
 * @apiDescription Delete a Content Breakout
 * @apiHeader {String} authorization JWT Token.
 * @apiName DeleteContentBreakout
 * @apiGroup ContentBreakout
 */
router.delete('/:id', deleteBreakout);

export default router;