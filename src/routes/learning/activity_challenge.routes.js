import Express from 'express';
import { getChallenges, createChallenge, updateChallenge, deleteChallenge } from '../../controllers/learning/challenge.controller';
// import { apiNotReady } from '../../controllers/api.controller';

const router = Express.Router();

/**
 * @api {get} /learning/activity/challenges Get all Activity Challenges
 * @apiDescription get all Activity Challenges
 * @apiHeader {String} authorization JWT Token.
 * @apiName GetActivityChallenges
 * @apiGroup ActivityChallenges
 */
router.get('/', getChallenges);

/**
 * @api {post} /learning/activity/challenges/ Add Activity Challenge
 * @apiDescription Add a Activity Challenge
 * @apiHeader {String} authorization JWT Token.
 * @apiName AddActivityChallenge
 * @apiGroup ActivityChallenge
 *
 * @apiParam {String} topic_id Id of the topic.
 * @apiParam {String} description Description of the challenge.
 * @apiParam {String} starter_repo Repository of the challenge.
 * @apiParam {String="easy","medium","difficult"} difficulty Difficulty of the challenge.
 * @apiParam {String="tiny","small","large"} size Size of the challenge.
 */
router.post('/', createChallenge);

/**
 * @api {patch} /learning/activity/challenges/:id  Update Activity Challenge
 * @apiDescription Update a Activity Challenge
 * @apiHeader {String} authorization JWT Token.
 * @apiName UpdateActivityChallenge
 * @apiGroup ActivityChallenge
 *
 * @apiParam {String} topic_id Id of the topic.
 * @apiParam {String} description Description of the challenge.
 * @apiParam {String} starter_repo Repository of the challenge.
 * @apiParam {String="easy","medium","difficult"} difficulty Difficulty of the challenge.
 * @apiParam {String="tiny","small","large"} size Size of the challenge.
 */
router.patch('/:id', updateChallenge);

/**
 * @api {delete} /learning/activity/challenges/:id Delete Activity Challenge
 * @apiDescription Delete a Activity Challenge
 * @apiHeader {String} authorization JWT Token.
 * @apiName DeleteActivityChallenge
 * @apiGroup ActivityChallenge
 */
router.delete('/:id', deleteChallenge);

export default router;
