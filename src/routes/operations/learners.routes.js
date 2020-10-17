import Express from 'express';
import {
  onLeaveController,
} from '../../controllers/operations/learners.controller';
import { USER_ROLES } from '../../models/user';
import {
  allowMultipleRoles,
} from '../../controllers/auth/roles.controller';

const {
  ADMIN, SUPERADMIN, OPERATIONS, EDUCATOR,
} = USER_ROLES;

const router = Express.Router();

router.use(allowMultipleRoles([ADMIN, SUPERADMIN, OPERATIONS, EDUCATOR]));

/**
 * @api {post} /operations/catalyst Adds catalyst to delta
 * @apiDescription Add a new catalyst
 * @apiHeader {String} authorization JWT Token.
 * @apiName CreateCatalyst
 * @apiGroup Catalyst
 */
router.patch('/onleave', onLeaveController);

export default router;
