import Express from 'express';
import {
  getAllAssessmentSlotsAPI, getAssessmentSlotsByIdAPI, getAssessmentSlotsByProgramAPI,
  createAssessmentSlotsAPI, updateAssessmentSlotsAPI, deleteAssessmentSlotAPI,
} from '../../controllers/learning/content_assessment_slots.controller';
import {
  allowMultipleRoles,
  allowAdminsOnly,
} from '../../controllers/auth/roles.controller';
import { USER_ROLES } from '../../models/user';

const {
  ADMIN, CATALYST, EDUCATOR,
} = USER_ROLES;

const router = Express.Router();

router.use(allowMultipleRoles([ADMIN, CATALYST, EDUCATOR]));

/**
 * @api {get} /learning/content/assessment-slots Get all AssessmentSlots
 * @apiDescription get all AssessmentSlots
 * @apiHeader {String} authorization JWT Token.
 * @apiName GetAssessmentSlots
 * @apiGroup AssessmentSlots
 */
router.get('/', getAllAssessmentSlotsAPI);

/**
 * @api {get} /learning/content/assessment-slots/:id Get assessment-slots by ID
 * @apiDescription get  assessment-slots by ID
 * @apiHeader {String} authorization JWT Token.
 * @apiName GetAssessmentSlots
 * @apiGroup AssessmentSlots
 */
router.get('/:id', getAssessmentSlotsByIdAPI);

/**
 * @api {get} /learning/content/assessment-slots/program/:program Get assessment-slots by program
 * @apiDescription get assessment-slots by id
 * @apiHeader {String} authorization JWT Token.
 * @apiName GetAssessmentSlots
 * @apiGroup AssessmentSlots
 */
router.get('/assessment/:id', getAssessmentSlotsByProgramAPI);

// Restrict modifications for any applicant to the cohorts
router.use(allowAdminsOnly);

/**
 * @api {post} /learning/content/assessment-slots/ Add AssessmentSlots
 * @apiDescription Add a AssessmentSlot
 * @apiHeader {String} authorization JWT Token.
 * @apiName AddAssessmentSlot
 * @apiGroup AssessmentSlots

 * @apiParam {String} milestone_id  Milestone ID
 * @apiParam {String} rubric_name Name of the AssessmentSlot
 * @apiParam {String} program Program associated to
 * @apiParam {String} rubric_parameters json AssessmentSlot parameters
 */
router.post('/', createAssessmentSlotsAPI);

/**
 * @api {patch} /learning/content/assessment-slots/:id  Update AssessmentSlots
 * @apiDescription Update a AssessmentSlot
 * @apiHeader {String} authorization JWT Token.
 * @apiName UpdateAssessmentSlot
 * @apiGroup AssessmentSlots
 *
 * @apiParam {String} id AssessmentSlot ID
 * @apiParam {String} rubric_parameters json AssessmentSlot parameters
 */
router.patch('/:id', updateAssessmentSlotsAPI);

/**
 * @api {delete} /learning/content/assessment-slots/:id Delete AssessmentSlot
 * @apiDescription Delete a Content AssessmentSlot
 * @apiHeader {String} authorization JWT Token.
 * @apiName DeleteAssessmentSlot
 * @apiGroup AssessmentSlots
 */
router.delete('/:id', deleteAssessmentSlotAPI);

export default router;
