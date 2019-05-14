import Express from 'express';
import {getOne, dayDetails, update, getAll, addPromptToTimeline, getToday,
  updatePongs, addContentToDay, removePromptFromTimeline, resetPairs, resetDay} from '../controllers/day.controller';
import {populateCurrentUser} from '../controllers/user.controller';
import {resetPingpongs} from '../controllers/pingpong.controller';
import {allowSuperAdminOnly} from '../controllers/roles.controller';

const router = Express.Router();

/**
 * @api {get} /days Get all days
 * @apiHeader {String} authorization JWT Token.
 * @apiName GetDays
 * @apiGroup Day
 */
router.get('/', getAll);
router.get('/:dayNumber/dn', dayDetails);
// Assuming only students will be accessing the path
router.get('/today', populateCurrentUser, getToday);
router.get('/:day_id/dId', getOne);
router.patch('/:day_id', update);
router.patch('/:day_id/timeline', addPromptToTimeline);
router.patch('/:day_id/content', addContentToDay);
router.patch('/:day_id/timelines/:timeline_id', removePromptFromTimeline)

/**
 * @api {patch} /days/:day_id/reset Reset day of a cohort
 * @apiPermission none
 * @apiHeader {String} authorization JWT Token.
 * @apiName ResetDay
 * @apiGroup Day
 *
 * @apiParam {String} replicate Day unique ID to copy from.
 */
router.patch('/:day_id/reset', resetDay);

/**
 * @api {patch} /:day_id/pingpongs/reset Reset pingpongs for the day
 * @apiPermission none
 * @apiHeader {String} authorization JWT Token.
 * @apiName ResetPingpongs
 * @apiGroup Day
 */
router.patch('/:day_id/pingpongs/reset', resetPingpongs);

/**
 * @api {patch} /:day_id/pairs/reset Reset pairs for the day
 * @apiPermission none
 * @apiHeader {String} authorization JWT Token.
 * @apiName ResetPairs
 * @apiGroup Day
 */
router.patch('/:day_id/pairs/reset', resetPairs);

export default router;
