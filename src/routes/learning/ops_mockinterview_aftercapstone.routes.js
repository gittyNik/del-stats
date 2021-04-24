import Express from 'express';
import {
  createMockInterviewsSlotsApi,
  createMockInterviewsApi,
  updateMockInterviewsSlotsByIdApi,
  deleteMockInterviewsSlotsByIdApi,
} from '../../controllers/learning/ops_mockinterview.controller';

import { allowMultipleRoles } from '../../controllers/auth/roles.controller';
import { USER_ROLES } from '../../models/user';

const {
  ADMIN, OPERATIONS,
} = USER_ROLES;

const router = Express.Router();

router.use(allowMultipleRoles([ADMIN, OPERATIONS]));
/**
 * @api {get} /learning/ops/aftercapstone Get all mockinterviews
 * @apiDescription get all Breakouts attended by learnes
 * @apiHeader {String} authorization JWT Token.
 * @apiName GetBreakouts
 * @apiGroup Breakouts
 */
// router.get('/', getAllMockInterviewsApi);

/**
 * @api {post} /learning/ops/aftercapstone create mockinterviews slots
 * @apiDescription Create Mock Interview Slots
 * @apiHeader {String} authorization JWT Token.
 * @apiName createMockInterview
 * @apiGroup MockInterviews
 */
router.post('/', createMockInterviewsSlotsApi);

/**
 * @api {post} /learning/ops/aftercapstone create mockinterviews slots
 * @apiDescription Create Mock Interview Slots
 * @apiHeader {String} authorization JWT Token.
 * @apiName createMockInterview
 * @apiGroup MockInterviews
 */
router.patch('/:id', updateMockInterviewsSlotsByIdApi);

/**
 * @api {post} /learning/ops/aftercapstone create mockinterviews slots
 * @apiDescription Create Mock Interview Slots
 * @apiHeader {String} authorization JWT Token.
 * @apiName createMockInterview
 * @apiGroup MockInterviews
 */
router.delete('/:id', deleteMockInterviewsSlotsByIdApi);

/**
 * @api {post} /learning/ops/aftercapstone/slots/create create mockinterviews slots
 * @apiDescription Create Mock Interview Slots
 * @apiHeader {String} authorization JWT Token.
 * @apiName createMockInterview
 * @apiGroup MockInterviews
 */
router.post('/slots/create', createMockInterviewsApi);

export default router;
