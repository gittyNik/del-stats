import Express from 'express';
import {
  getPongs, createPong, updatePong, deletePong,
} from '../../controllers/learning/pong.controller';

const router = Express.Router();

/**
 * @api {get} /learning/nudge/pongs Get all Nudge Pongs
 * @apiDescription get all Nudge Pongs
 * @apiHeader {String} authorization JWT Token.
 * @apiName GetNudgePongs
 * @apiGroup NudgePongs
 */
router.get('/', getPongs);

/**
 * @api {post} /learning/nudge/pongs/ Add Nudge Pong
 * @apiDescription Add a Nudge Pong
 * @apiHeader {String} authorization JWT Token.
 * @apiName AddNudgePong
 * @apiGroup NudgePong
 *
 * @apiParam {String} ping_id Id of the ping
 * @apiParam {String} learner_id Id of the learner
 * @apiParam {Object} response Response in a Pong
 */
router.post('/', createPong);

/**
 * @api {patch} /learning/nudge/pongs/:id  Update Nudge Pongs
 * @apiDescription Update a Nudge Pong
 * @apiHeader {String} authorization JWT Token.
 * @apiName UpdateNudgePong
 * @apiGroup NudgePong
 *
 * @apiParam {String} ping_id Id of the ping
 * @apiParam {String} learner_id Id of the learner
 * @apiParam {Object} response Response in a Pong
 */
router.patch('/:id', updatePong);

/**
 * @api {delete} /learning/nudge/pongs/:id Delete Nudge Pongs
 * @apiDescription Delete a Nudge Pong
 * @apiHeader {String} authorization JWT Token.
 * @apiName DeleteNudgePong
 * @apiGroup NudgePong
 */
router.delete('/:id', deletePong);

export default router;
