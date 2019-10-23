import Express from 'express';
import { apiNotReady } from '../../controllers/api.controller';

const router = Express.Router();

/**
 * @api {get} /learning/nudge/pings Get all Nudge Pings
 * @apiDescription get all Nudge Pings
 * @apiHeader {String} authorization JWT Token.
 * @apiName GetNudgePings
 * @apiGroup NudgePings
 */
router.get('/', apiNotReady);

/**
 * @api {post} /learning/nudge/pings/ Add Nudge Ping
 * @apiDescription Add a Nudge Ping
 * @apiHeader {String} authorization JWT Token.
 * @apiName AddNudgePing
 * @apiGroup NudgePing
 */
router.post('/', apiNotReady);

/**
 * @api {patch} /learning/nudge/pings/:id  Update Nudge Pings
 * @apiDescription Update a Nudge Ping
 * @apiHeader {String} authorization JWT Token.
 * @apiName UpdateNudgePing
 * @apiGroup NudgePing
 */
router.patch('/:id', apiNotReady);

/**
 * @api {delete} /learning/nudge/pings/:id Delete Nudge Pings
 * @apiDescription Delete a Nudge Ping
 * @apiHeader {String} authorization JWT Token.
 * @apiName DeleteNudgePing
 * @apiGroup NudgePing
 */
router.delete('/:id', apiNotReady);

export default router;
