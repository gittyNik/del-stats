import Express from 'express';
import {
  addCatalyst, cumulativeTimeTakenApi, sessionsStartedOnTime,
  getAllBreakoutRecordingsForCatalystApi, getCumulativeTimeTakenForAll,
} from '../../controllers/operations/catalyst.controller';
import { USER_ROLES } from '../../models/user';
import {
  allowMultipleRoles,
} from '../../controllers/auth/roles.controller';

const {
  ADMIN, CATALYST, OPERATIONS, EDUCATOR,
} = USER_ROLES;

const router = Express.Router();

router.use(allowMultipleRoles([ADMIN, CATALYST, OPERATIONS, EDUCATOR]));

/**
 * @api {post} /operations/catalyst/getAllBOForCatalyst/:id returns likes, views, ratings
 * @apiDescription returns likes, views, ratings of BO by catalyst
 * @apiHeader {String} authorization JWT Token.
 * @apiName getAllBOForCatalyst
 * @apiGroup Catalyst
 */
// returns cumulative time taken by catalyst for day, week, month and overall
router.post('/getAllBOForCatalyst/:id', getAllBreakoutRecordingsForCatalystApi);

/**
 * @api {post} /operations/catalyst/cumulativeTimeTaken returns cumulative time for catalysts
 * @apiDescription returns cumulative time taken by catalyst for day, week, month and overall
 * @apiHeader {String} authorization JWT Token.
 * @apiName TimeTakenByCatalyst
 * @apiGroup Catalyst
 */
// returns cumulative time taken by catalyst for day, week, month and overall
router.get('/cumulativeTimeTaken/:id', cumulativeTimeTakenApi);

router.use(allowMultipleRoles([ADMIN, OPERATIONS, EDUCATOR]));

/**
 * @api {post} /operations/catalyst Adds catalyst to delta
 * @apiDescription Add a new catalyst
 * @apiHeader {String} authorization JWT Token.
 * @apiName CreateCatalyst
 * @apiGroup Catalyst
 */
router.post('/', addCatalyst);

/**
 * @api {post} /operations/catalyst/getCumulativeTimeTakenForAll returns cumulative time for all catalysts
 * @apiDescription returns cumulative time taken by catalyst for day, week, month and overall, paginated with limit and offset
 * @apiHeader {String} authorization JWT Token.
 * @apiName TimeTakenByCatalyst
 * @apiGroup Catalyst
 */
// returns cumulative time taken by catalyst for day, week, month and overall
router.post('/CumulativeTimeTakenForAll/', getCumulativeTimeTakenForAll);

/**
 * @api {post} /operations/catalyst/sessionsStartedOnTime returns count of sessions started on time
 * @apiDescription returns count of sessions started on time
 * @apiHeader {String} authorization JWT Token.
 * @apiName CountSessionsStartedOnTime
 * @apiGroup Catalyst
 */
// returns cumulative time taken by catalyst for day, week, month and overall
router.post('/sessionsStartedOnTime/:id', sessionsStartedOnTime);

export default router;
