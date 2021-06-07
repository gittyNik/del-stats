import Express from 'express';
import {
  createMockInterviewsSlotsApi,
  createMockInterviewsApi,
  updateMockInterviewsSlotsByIdApi,
  deleteMockInterviewsSlotsByIdApi,
  createMockInterviewsRubricsApi,
} from '../../controllers/learning/ops_mockinterview.controller';

import { allowMultipleRoles } from '../../controllers/auth/roles.controller';
import { USER_ROLES } from '../../models/user';

const {
  ADMIN, OPERATIONS,
} = USER_ROLES;

const router = Express.Router();

router.use(allowMultipleRoles([ADMIN, OPERATIONS]));
/**
 * @api {get} /learning/ops/mockinterviews/aftercapstone Get all mockinterviews
 * @apiDescription get all Breakouts attended by learnes
 * @apiHeader {String} authorization JWT Token.
 * @apiName GetBreakouts
 * @apiGroup Breakouts
 */
// router.get('/', getAllMockInterviewsApi);

/**
 * @api {post} /learning/ops/mockinterviews/aftercapstone create mockinterviews slots
 * @apiDescription Create Mock Interview Slots
 * @apiHeader {String} authorization JWT Token.
 * @apiName createMockInterview
 * @apiGroup MockInterviews
 */
router.post('/', createMockInterviewsSlotsApi);

/**
 * @api {patch} /learning/ops/mockinterviews/aftercapstone/:id update mockinterviews slots
 * @apiDescription Create Mock Interview Slots
 * @apiHeader {String} authorization JWT Token.
 * @apiName createMockInterview
 * @apiGroup MockInterviews
 */
router.patch('/:id', updateMockInterviewsSlotsByIdApi);

/**
 * @api {delete} /learning/ops/mockinterviews/aftercapstone/:id delete mockinterviews slots
 * @apiDescription Create Mock Interview Slots
 * @apiHeader {String} authorization JWT Token.
 * @apiName createMockInterview
 * @apiGroup MockInterviews
 */
router.delete('/:id', deleteMockInterviewsSlotsByIdApi);

/**
 * @api {post} /learning/ops/mockinterviews/aftercapstone/slots/create create mockinterviews slots
 * @apiDescription Create Mock Interview Slots
 * @apiHeader {String} authorization JWT Token.
 * @apiName createMockInterview
 * @apiGroup MockInterviews
 */
router.post('/slots/create', createMockInterviewsApi);

/**
 * @api {post} /learning/ops/mockinterviews/aftercapstone/rubrics/create create mockinterviews rubrics
 * @apiDescription Create Mock Interview rubrics
 * @apiHeader {String} authorization JWT Token.
 * @apiName createMockInterview
 * @apiGroup MockInterviews
 */
router.post('/rubrics/create', createMockInterviewsRubricsApi);

export default router;
