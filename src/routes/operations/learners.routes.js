import Express from 'express';
import {
  onLeaveController,
  addLearnerForDesign,
} from '../../controllers/operations/learners.controller';
import { USER_ROLES } from '../../models/user';
import {
  allowMultipleRoles,
} from '../../controllers/auth/roles.controller';

const {
  ADMIN, OPERATIONS, EDUCATOR,
} = USER_ROLES;

const router = Express.Router();

router.use(allowMultipleRoles([ADMIN, OPERATIONS, EDUCATOR]));

/**
 * @api {post} /learner/design Adds Learners to delta for design program
 * @apiDescription Add a new learner
 * @apiHeader {String} authorization JWT Token.
 * @apiName CreateLearner
 * @apiGroup Learners
 */
router.post('/design', addLearnerForDesign);

/**
 * @api {post} /learner/onleave Updates learner as on leave throughout delta
 * @apiDescription Updates Learner status
 * @apiHeader {String} authorization JWT Token.
 * @apiName UpdateLearner
 * @apiGroup Learners
 */
router.patch('/onleave', onLeaveController);

export default router;
