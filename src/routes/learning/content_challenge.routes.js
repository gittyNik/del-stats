import Express from 'express';
import { apiNotReady } from '../../controllers/api.controller';

const router = Express.Router();

/**
 * @api {get} /learning/content/challenges Get all Content Challenges
 * @apiDescription get all Content Challenges
 * @apiHeader {String} authorization JWT Token.
 * @apiName GetContentChallenges
 * @apiGroup ContentChallenges
 */
router.get('/', apiNotReady);

/**
 * @api {post} /learning/content/challenges/ Add Content Challenge
 * @apiDescription Add a Content Challenge
 * @apiHeader {String} authorization JWT Token.
 * @apiName AddContentChallenge
 * @apiGroup ContentChallenge
 */
router.post('/', apiNotReady);

/**
 * @api {patch} /learning/content/challenges/:id  Update Content Challenge
 * @apiDescription Update a Content Challenge
 * @apiHeader {String} authorization JWT Token.
 * @apiName UpdateContentChallenge
 * @apiGroup ContentChallenge
 */
router.patch('/:id', apiNotReady);

/**
 * @api {delete} /learning/content/challenges/:id Delete Content Challenge
 * @apiDescription Delete a Content Challenge
 * @apiHeader {String} authorization JWT Token.
 * @apiName DeleteContentChallenge
 * @apiGroup ContentChallenge
 */
router.delete('/:id', apiNotReady);

export default router;
