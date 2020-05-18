import Express from 'express';
import {
  getAllReviewSlotsAPI, getReviewSlotsByIdAPI, getReviewSlotsByProgramAPI,
  createReviewSlotsAPI, updateReviewSlotsAPI, deleteReviewSlotAPI,
} from '../../controllers/learning/content_review_slot.controller';
import { allowMultipleRoles, allowAdminsOnly } from '../../controllers/auth/roles.controller';
import { USER_ROLES } from '../../models/user';

const {
  ADMIN, SUPERADMIN, CATALYST, EDUCATOR,
} = USER_ROLES;

const router = Express.Router();

router.use(allowMultipleRoles([ADMIN, SUPERADMIN, CATALYST, EDUCATOR]));

/**
 * @api {get} /learning/content/review-slots Get all ReviewSlots
 * @apiDescription get all ReviewSlots
 * @apiHeader {String} authorization JWT Token.
 * @apiName GetReviewSlots
 * @apiGroup ReviewSlots
 */
router.get('/', getAllReviewSlotsAPI);

/**
 * @api {get} /learning/content/review-slots/:id Get review-slots by ID
 * @apiDescription get  review-slots by ID
 * @apiHeader {String} authorization JWT Token.
 * @apiName GetReviewSlots
 * @apiGroup ReviewSlots
 */
router.get('/:id', getReviewSlotsByIdAPI);

/**
 * @api {get} /learning/content/review-slots/program/:program Get review-slots by program
 * @apiDescription get review-slots by id
 * @apiHeader {String} authorization JWT Token.
 * @apiName GetReviewSlots
 * @apiGroup ReviewSlots
 */
router.get('/review/:id', getReviewSlotsByProgramAPI);


// Restrict modifications for any applicant to the cohorts
router.use(allowAdminsOnly);


/**
 * @api {post} /learning/content/review-slots/ Add ReviewSlots
 * @apiDescription Add a ReviewSlot
 * @apiHeader {String} authorization JWT Token.
 * @apiName AddReviewSlot
 * @apiGroup ReviewSlots

 * @apiParam {String} milestone_id  Milestone ID
 * @apiParam {String} rubric_name Name of the ReviewSlot
 * @apiParam {String} program Program associated to
 * @apiParam {String} rubric_parameters json ReviewSlot parameters
 */
router.post('/', createReviewSlotsAPI);

/**
 * @api {patch} /learning/content/review-slots/:id  Update ReviewSlots
 * @apiDescription Update a ReviewSlot
 * @apiHeader {String} authorization JWT Token.
 * @apiName UpdateReviewSlot
 * @apiGroup ReviewSlots
 *
 * @apiParam {String} id ReviewSlot ID
 * @apiParam {String} rubric_parameters json ReviewSlot parameters
 */
router.patch('/:id', updateReviewSlotsAPI);

/**
 * @api {delete} /learning/content/review-slots/:id Delete ReviewSlot
 * @apiDescription Delete a Content ReviewSlot
 * @apiHeader {String} authorization JWT Token.
 * @apiName DeleteReviewSlot
 * @apiGroup ReviewSlots
 */
router.delete('/:id', deleteReviewSlotAPI);

export default router;
