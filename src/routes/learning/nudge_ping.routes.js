import Express from 'express';
import {
  getAllPings, createPing, updatePing, deletePing,
} from '../../controllers/learning/ping.controller';

const router = Express.Router();

/**
 * @api {get} /learning/nudge/pings Get all Nudge Pings
 * @apiDescription get all Nudge Pings
 * @apiHeader {String} authorization JWT Token.
 * @apiName GetNudgePings
 * @apiGroup NudgePings
 */
router.get('/', getAllPings);

/**
 * @api {post} /learning/nudge/pings/ Add Nudge Ping
 * @apiDescription Add a Nudge Ping
 * @apiHeader {String} authorization JWT Token.
 * @apiName AddNudgePing
 * @apiGroup NudgePing
 *
 * @apiParam {String} ping_template_id Id of the ping template
 * @apiParam {String="immediate","trigger"} type Type of ping
 * @apiParam {Object} trigger Trigger Object
 * @apiParam {String} educator_id Id of the educator
 * @apiParam {String[]} recipiens Array of recipients id
 * @apiParam {String="draft","sent","delivered"} status Status of the ping
 * @apiParam {Number} time_scheduled Scheduled time
 */
router.post('/', createPing);

/**
 * @api {patch} /learning/nudge/pings/:id  Update Nudge Pings
 * @apiDescription Update a Nudge Ping
 * @apiHeader {String} authorization JWT Token.
 * @apiName UpdateNudgePing
 * @apiGroup NudgePing
 *
 * @apiParam {String} ping_template_id Id of the ping template
 * @apiParam {String="immediate","trigger"} type Type of ping
 * @apiParam {Object} trigger Trigger Object
 * @apiParam {String} educator_id Id of the educator
 * @apiParam {String[]} recipiens Array of recipients id
 * @apiParam {String="draft","sent","delivered"} status Status of the ping
 * @apiParam {Number} time_scheduled Scheduled time
 */
router.patch('/:id', updatePing);

/**
 * @api {delete} /learning/nudge/pings/:id Delete Nudge Pings
 * @apiDescription Delete a Nudge Ping
 * @apiHeader {String} authorization JWT Token.
 * @apiName DeleteNudgePing
 * @apiGroup NudgePing
 */
router.delete('/:id', deletePing);

export default router;
