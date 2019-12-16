import Express from 'express';
import { getLearnerChallenges, createLearnerChallenge, updateLearnerChallenge, deleteLearnerChallenge } from '../../controllers/learning/challenge.controller';

const router = Express.Router();

/**
 * @api {get} /learning/activity/challenges Get all Activity Challenges
 * @apiDescription get all Activity Challenges
 * @apiHeader {String} authorization JWT Token.
 * @apiName GetActivityChallenges
 * @apiGroup ActivityChallenges
 */
router.get('/', getLearnerChallenges);

/**
 * @api {post} /learning/activity/challenges/ Add Activity Challenge
 * @apiDescription Add a Activity Challenge
 * @apiHeader {String} authorization JWT Token.
 * @apiName AddActivityChallenge
 * @apiGroup ActivityChallenge
 *
 * @apiParam {String} challenge_id Id of the Challenge.
 * @apiParam {String} learner_id Id of the learner.
 * @apiParam {String} repo Repository of the challenge.
 * @apiParam {String} learner_feedback Feedback of the learner
 * @apiParam {String} review Review
 * @apiParam {String} reviewed_by Id of the reviewed user
 */
router.post('/', createLearnerChallenge);

/**
 * @api {patch} /learning/activity/challenges/:id  Update Activity Challenge
 * @apiDescription Update a Activity Challenge
 * @apiHeader {String} authorization JWT Token.
 * @apiName UpdateActivityChallenge
 * @apiGroup ActivityChallenge
 * 
 * @apiParam {String} challenge_id Id of the Challenge.
 * @apiParam {String} learner_id Id of the learner.
 * @apiParam {String} repo Repository of the challenge.
 * @apiParam {String} learner_feedback Feedback of the learner
 * @apiParam {String} review Review
 * @apiParam {String} reviewed_by Id of the reviewed user
 */
router.patch('/:id', updateLearnerChallenge);

/**
 * @api {delete} /learning/activity/challenges/:id Delete Activity Challenge
 * @apiDescription Delete a Activity Challenge
 * @apiHeader {String} authorization JWT Token.
 * @apiName DeleteActivityChallenge
 * @apiGroup ActivityChallenge
 */
router.delete('/:id', deleteLearnerChallenge);

export default router;
