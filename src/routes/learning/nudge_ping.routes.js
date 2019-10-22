import Express from 'express';
import { apiNotReady } from '../../controllers/api.controller';

const router = Express.Router();

/**
 * @api {get} /learning/ping/templates Get all Ping Nudges
 * @apiDescription get all Ping Nudges
 * @apiHeader {String} authorization JWT Token.
 * @apiName GetPingNudges
 * @apiGroup PingNudges
 */
router.get('/', apiNotReady);

/**
 * @api {post} /learning/ping/templates/ Add Career Counsellor
 * @apiDescription Add a Ping Nudge
 * @apiHeader {String} authorization JWT Token.
 * @apiName AddPingNudges
 * @apiGroup PingNudges
 */
router.post('/', apiNotReady);

/**
 * @api {patch} /learning/ping/templates/:id  Update Career Counsellor
 * @apiDescription Update a Ping Nudge
 * @apiHeader {String} authorization JWT Token.
 * @apiName UpdatePingNudges
 * @apiGroup PingNudges
 */
router.patch('/:id', apiNotReady);

/**
 * @api {delete} /learning/ping/templates/:id Delete Career Counsellor
 * @apiDescription Delete a Ping Nudge
 * @apiHeader {String} authorization JWT Token.
 * @apiName DeletePingNudges
 * @apiGroup PingNudges
 */
router.delete('/:id', apiNotReady);

export default router;
