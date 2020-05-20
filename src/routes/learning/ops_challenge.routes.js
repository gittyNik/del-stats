import Express from 'express';
import { getLearnerChallenges, createLearnerChallenge } from '../../controllers/learning/challenge.controller';

import { allowMultipleRoles } from '../../controllers/auth/roles.controller';
import { USER_ROLES } from '../../models/user';

const router = Express.Router();

const {
  ADMIN, CATALYST, EDUCATOR, LEARNER,
} = USER_ROLES;

router.use(allowMultipleRoles([ADMIN, CATALYST, EDUCATOR, LEARNER]));

/**
 * @api {get} /learning/challenges Get all Challenges submitted by learnes
 * @apiDescription get all Challenges submitted by learnes
 * @apiHeader {String} authorization JWT Token.
 * @apiName GetChallenges
 * @apiGroup Challenges
 */
router.get('/', getLearnerChallenges);

/**
 * @api {post} /learning/challenges Submit a Challenge
 * @apiDescription Submit a Challenge that the learner has worked on
 * @apiHeader {String} authorization JWT Token.
 * @apiName AddChallenge
 * @apiGroup Challenge
 */
router.post('/', createLearnerChallenge);

export default router;
