import Express from 'express';
import {
  addCatalyst, cumulativeTimeTaken, sessionsStartedOnTime, getAllBreakoutRecordingsForCatalystApi,
} from '../../controllers/operations/catalyst.controller';
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
router.post('/', addCatalyst);

/**
 * @api {post} /operations/catalyst/cumulativeTimeTaken returns cumulative time for catalysts
 * @apiDescription returns cumulative time taken by catalyst for day, week, month and overall
 * @apiHeader {String} authorization JWT Token.
 * @apiName TimeTakenByCatalyst
 * @apiGroup Catalyst
 */
// returns cumulative time taken by catalyst for day, week, month and overall
router.post('/cumulativeTimeTaken/:id', cumulativeTimeTaken);

/**
 * @api {post} /operations/catalyst/sessionsStartedOnTime returns count of sessions started on time
 * @apiDescription returns count of sessions started on time
 * @apiHeader {String} authorization JWT Token.
 * @apiName CountSessionsStartedOnTime
 * @apiGroup Catalyst
 */
// returns cumulative time taken by catalyst for day, week, month and overall
router.post('/sessionsStartedOnTime/:id', sessionsStartedOnTime);

/**
 * @api {post} /operations/catalyst/getAllBOForCatalyst/:id returns likes, views, ratings
 * @apiDescription returns likes, views, ratings of BO by catalyst
 * @apiHeader {String} authorization JWT Token.
 * @apiName getAllBOForCatalyst
 * @apiGroup Catalyst
 */
// returns cumulative time taken by catalyst for day, week, month and overall
router.post('/getAllBOForCatalyst/:id', getAllBreakoutRecordingsForCatalystApi);

export default router;
