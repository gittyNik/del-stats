import Express from 'express';
import {
  
} from '../../controllers/learning/learner_breakout.controller';
import {

} from '../../controllers/learning/breakout.controller';

import { allowMultipleRoles } from '../../controllers/auth/roles.controller';
import { USER_ROLES } from '../../models/user';

const {
  ADMIN, SUPERADMIN, CATALYST, EDUCATOR, REVIEWER,
} = USER_ROLES;

const router = Express.Router();

/**
 * @api {get} /learning/ops/aftercapstone Get all mockinterviews
 * @apiDescription get all Breakouts attended by learnes
 * @apiHeader {String} authorization JWT Token.
 * @apiName GetBreakouts
 * @apiGroup Breakouts
 */
// router.get('/', getAllMockInterviewsApi);



export default router;
