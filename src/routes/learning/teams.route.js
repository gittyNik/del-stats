import Express from 'express';
import {
  addLearnerToTeamEndpoint, removeLearnerFromMSTeamEndpoint, moveLearnerBetweenMSTeamEndpoint,
} from '../../controllers/learning/teams.controller';
import {
  allowMultipleRoles,
} from '../../controllers/auth/roles.controller';
import { USER_ROLES } from '../../models/user';

const {
  ADMIN, EDUCATOR,
} = USER_ROLES;

const router = Express.Router();

router.use(allowMultipleRoles([ADMIN, EDUCATOR]));

/**
 * @api {post} /teams/learner/add add learner to a pre-existing MS team
 * @apiHeader {String} authorization JWT Token.
 * @apiName AddLearnerToMSTeam
 * @apiGroup Teams
 */
router.post('/learner/add', addLearnerToTeamEndpoint);

/**
 * @api {post} /teams/learner/remove Remove learner from a pre-existing MS team
 * @apiHeader {String} authorization JWT Token.
 * @apiName RemoveLearnerFromMSTeam
 * @apiGroup Teams
 */
router.post('/learner/remove', removeLearnerFromMSTeamEndpoint);

/**
 * @api {post} /teams/learner/move Move learner from one MS team to another
 * @apiHeader {String} authorization JWT Token.
 * @apiName MoveLearnerBetweenMSTeam
 * @apiGroup Teams
 */
router.post('/learner/move', moveLearnerBetweenMSTeamEndpoint);

export default router;
