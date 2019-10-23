import Express from 'express';
import { apiNotReady } from '../../controllers/api.controller';

const router = Express.Router();

/**
 * @api {get} /learning/nudge/pongs Get all Nudge Pongs
 * @apiDescription get all Nudge Pongs
 * @apiHeader {String} authorization JWT Token.
 * @apiName GetNudgePongs
 * @apiGroup NudgePongs
 */
router.get('/', apiNotReady);

/**
 * @api {post} /learning/nudge/pongs/ Add Nudge Pong
 * @apiDescription Add a Nudge Pong
 * @apiHeader {String} authorization JWT Token.
 * @apiName AddNudgePong
 * @apiGroup NudgePong
 */
router.post('/', apiNotReady);

/**
 * @api {patch} /learning/nudge/pongs/:id  Update Nudge Pongs
 * @apiDescription Update a Nudge Pong
 * @apiHeader {String} authorization JWT Token.
 * @apiName UpdateNudgePong
 * @apiGroup NudgePong
 */
router.patch('/:id', apiNotReady);

/**
 * @api {delete} /learning/nudge/pongs/:id Delete Nudge Pongs
 * @apiDescription Delete a Nudge Pong
 * @apiHeader {String} authorization JWT Token.
 * @apiName DeleteNudgePong
 * @apiGroup NudgePong
 */
router.delete('/:id', apiNotReady);

export default router;
