import Express from 'express';
import {
 getApplicantPlansEndpoint
} from '../../controllers/operations/payment.controller';
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
 * @api {post} /learner/design Adds Learners to delta for design program
 * @apiDescription Add a new learner
 * @apiHeader {String} authorization JWT Token.
 * @apiName CreateLearner
 * @apiGroup Learners
 */
router.get('/applicant/:id', getApplicantPlansEndpoint);


export default router;
