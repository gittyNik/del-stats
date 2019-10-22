import Express from 'express';
import { apiNotReady } from '../../controllers/api.controller';

const router = Express.Router();

/**
 * @api {get} /learning/ping/templates Get all Ping Pongs
 * @apiDescription get all Ping Pongs
 * @apiHeader {String} authorization JWT Token.
 * @apiName GetPingPongs
 * @apiGroup PingPongs
 */
router.get('/', apiNotReady);

/**
 * @api {post} /learning/ping/templates/ Add Career Counsellor
 * @apiDescription Add a Ping Pong
 * @apiHeader {String} authorization JWT Token.
 * @apiName AddPingPongs
 * @apiGroup PingPongs
 */
router.post('/', apiNotReady);

/**
 * @api {patch} /learning/ping/templates/:id  Update Career Counsellor
 * @apiDescription Update a Ping Pong
 * @apiHeader {String} authorization JWT Token.
 * @apiName UpdatePingPongs
 * @apiGroup PingPongs
 */
router.patch('/:id', apiNotReady);

/**
 * @api {delete} /learning/ping/templates/:id Delete Career Counsellor
 * @apiDescription Delete a Ping Pong
 * @apiHeader {String} authorization JWT Token.
 * @apiName DeletePingPongs
 * @apiGroup PingPongs
 */
router.delete('/:id', apiNotReady);

export default router;
