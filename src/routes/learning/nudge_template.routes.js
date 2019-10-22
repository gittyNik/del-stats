import Express from 'express';
import { apiNotReady } from '../../controllers/api.controller';

const router = Express.Router();

/**
 * @api {get} /learning/ping/templates Get all Ping Templates
 * @apiDescription get all Ping Templates
 * @apiHeader {String} authorization JWT Token.
 * @apiName GetPingTemplates
 * @apiGroup PingTemplates
 */
router.get('/', apiNotReady);

/**
 * @api {post} /learning/ping/templates/ Add Career Counsellor
 * @apiDescription Add a Ping Template
 * @apiHeader {String} authorization JWT Token.
 * @apiName AddPingTemplates
 * @apiGroup PingTemplates
 */
router.post('/', apiNotReady);

/**
 * @api {patch} /learning/ping/templates/:id  Update Career Counsellor
 * @apiDescription Update a Ping Template
 * @apiHeader {String} authorization JWT Token.
 * @apiName UpdatePingTemplates
 * @apiGroup PingTemplates
 */
router.patch('/:id', apiNotReady);

/**
 * @api {delete} /learning/ping/templates/:id Delete Career Counsellor
 * @apiDescription Delete a Ping Template
 * @apiHeader {String} authorization JWT Token.
 * @apiName DeletePingTemplates
 * @apiGroup PingTemplates
 */
router.delete('/:id', apiNotReady);

export default router;
