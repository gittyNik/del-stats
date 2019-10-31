import Express from 'express';
import { apiNotReady } from '../../controllers/api.controller';

const router = Express.Router();

/**
 * @api {get} /learning/activity/challenges Get all Activity Challenges
 * @apiDescription get all Activity Challenges
 * @apiHeader {String} authorization JWT Token.
 * @apiName GetActivityChallenges
 * @apiGroup ActivityChallenges
 */
router.get('/', apiNotReady);

/**
 * @api {post} /learning/activity/challenges/ Add Activity Challenge
 * @apiDescription Add a Activity Challenge
 * @apiHeader {String} authorization JWT Token.
 * @apiName AddActivityChallenge
 * @apiGroup ActivityChallenge
 */
router.post('/', apiNotReady);

/**
 * @api {patch} /learning/activity/challenges/:id  Update Activity Challenge
 * @apiDescription Update a Activity Challenge
 * @apiHeader {String} authorization JWT Token.
 * @apiName UpdateActivityChallenge
 * @apiGroup ActivityChallenge
 */
router.patch('/:id', apiNotReady);

/**
 * @api {delete} /learning/activity/challenges/:id Delete Activity Challenge
 * @apiDescription Delete a Activity Challenge
 * @apiHeader {String} authorization JWT Token.
 * @apiName DeleteActivityChallenge
 * @apiGroup ActivityChallenge
 */
router.delete('/:id', apiNotReady);

export default router;
