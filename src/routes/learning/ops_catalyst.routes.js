import Express from 'express';
import {
  getRequestsByStatusApi,
  updateRequestsStatusApi,
  createRequestsApi,
} from '../../controllers/learning/ops_mockinterview.controller';

import { allowMultipleRoles } from '../../controllers/auth/roles.controller';
import { USER_ROLES } from '../../models/user';

const {
  ADMIN, CATALYST, EDUCATOR, OPERATIONS,
} = USER_ROLES;

const router = Express.Router();

router.use(allowMultipleRoles([ADMIN, OPERATIONS, CATALYST, EDUCATOR]));
/**
 * @api {post} /learning/ops/catalyst/request/:status Get requests by status
 * breakouts for cohort breakout
 * @apiDescription get all requests
 * @apiHeader {String} authorization JWT Token.
 * @apiName GetBreakouts
 * @apiGroup Breakouts
 */
router.post('/request', createRequestsApi);

router.use(allowMultipleRoles([ADMIN, OPERATIONS, EDUCATOR]));

/**
 * @api {get} /learning/ops/catalyst/request/:status Get requests by status
 * breakouts for cohort breakout
 * @apiDescription get all requests
 * @apiHeader {String} authorization JWT Token.
 * @apiName GetBreakouts
 * @apiGroup Breakouts
 */
router.get('/request/:status', getRequestsByStatusApi);

/**
 * @api {get} /learning/ops/catalyst/request/:status Get requests by status
 * breakouts for cohort breakout
 * @apiDescription get all requests
 * @apiHeader {String} authorization JWT Token.
 * @apiName GetBreakouts
 * @apiGroup Breakouts
 */
router.patch('/request', updateRequestsStatusApi);

export default router;
