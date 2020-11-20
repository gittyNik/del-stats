import Express from 'express';
import {
  getChallenges, createChallenge, updateChallenge, deleteChallenge,
  getChallengesByTopic,
} from '../../controllers/learning/challenge.controller';
import {
  allowMultipleRoles,
  allowAdminsOnly,
} from '../../controllers/auth/roles.controller';
import { USER_ROLES } from '../../models/user';

const {
  ADMIN, CATALYST, EDUCATOR,
} = USER_ROLES;

const router = Express.Router();

router.use(allowMultipleRoles([ADMIN, CATALYST, EDUCATOR]));

/**
 * @api {get} /learning/content/challenges Get all Content Challenges
 * @apiDescription get all Content Challenges
 * @apiHeader {String} authorization JWT Token.
 * @apiName GetContentChallenges
 * @apiGroup ContentChallenges
 */
router.get('/', getChallenges);

/**
 * @api {get} /learning/content/challenges/topic/:id Get all Content Challenges by Topic
 * @apiDescription get all Content Challenges
 * @apiHeader {String} authorization JWT Token.
 * @apiName GetContentChallenges
 * @apiGroup ContentChallenges
 */
router.get('/topic/:id', getChallengesByTopic);

// Restrict modifications for any applicant to the cohorts
router.use(allowAdminsOnly);

/**
 * @api {post} /learning/content/challenges/ Add Content Challenge
 * @apiDescription Add a Content Challenge
 * @apiHeader {String} authorization JWT Token.
 * @apiName AddContentChallenge
 * @apiGroup ContentChallenge
 *
 * @apiParam {String} topic_id Id of the topic.
 * @apiParam {String} description Description of the challenge.
 * @apiParam {String} starter_repo Repository of the challenge.
 * @apiParam {String="easy","medium","difficult"} difficulty Difficulty of the challenge.
 * @apiParam {String="tiny","small","large"} size Size of the challenge.
 */
router.post('/', createChallenge);

/**
 * @api {patch} /learning/content/challenges/:id  Update Content Challenge
 * @apiDescription Update a Content Challenge
 * @apiHeader {String} authorization JWT Token.
 * @apiName UpdateContentChallenge
 * @apiGroup ContentChallenge
 *
 * @apiParam {String} topic_id Id of the topic.
 * @apiParam {String} description Description of the challenge.
 * @apiParam {String} starter_repo Repository of the challenge.
 * @apiParam {String="easy","medium","difficult"} difficulty Difficulty of the challenge.
 * @apiParam {String="tiny","small","large"} size Size of the challenge.
 */
router.patch('/:id', updateChallenge);

/**
 * @api {delete} /learning/content/challenges/:id Delete Content Challenge
 * @apiDescription Delete a Content Challenge
 * @apiHeader {String} authorization JWT Token.
 * @apiName DeleteContentChallenge
 * @apiGroup ContentChallenge
 */
router.delete('/:id', deleteChallenge);

export default router;
