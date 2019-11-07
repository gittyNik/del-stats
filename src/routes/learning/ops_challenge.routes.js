import Express from 'express';
import { apiNotReady } from '../../controllers/api.controller';

const router = Express.Router();

/**
 * @api {get} /learning/challenges Get all Challenges submitted by learnes
 * @apiDescription get all Challenges submitted by learnes
 * @apiHeader {String} authorization JWT Token.
 * @apiName GetChallenges
 * @apiGroup Challenges
 */
router.get('/', apiNotReady);

/**
 * @api {post} /learning/challenges Submit a Challenge
 * @apiDescription Submit a Challenge that the learner has worked on
 * @apiHeader {String} authorization JWT Token.
 * @apiName AddChallenge
 * @apiGroup Challenge
 */
router.post('/', apiNotReady);

export default router;