import Express from 'express';
import {
  getRequestsByStatusApi,
} from '../../controllers/learning/ops_mockinterview.controller';

import { allowMultipleRoles } from '../../controllers/auth/roles.controller';
import { USER_ROLES } from '../../models/user';

const {
  ADMIN, SUPERADMIN, CATALYST, EDUCATOR, REVIEWER,
} = USER_ROLES;

const router = Express.Router();

/**
 * @api {get} /learning/ops/catalyst/request/:status Get requests by status
 * breakouts for cohort breakout
 * @apiDescription get all requests
 * @apiHeader {String} authorization JWT Token.
 * @apiName GetBreakouts
 * @apiGroup Breakouts
 */
router.get('/request/:status', getRequestsByStatusApi);

export default router;
