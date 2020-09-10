import Express from 'express';
import {
  getAllRubricsAPI, getRubricsByIdAPI, getRubricsByProgramAPI,
  createRubricsAPI, updateRubricsAPI, deleteRubricAPI,
  getRubricsByMilestoneAPI,
} from '../../controllers/learning/content_rubrics.controller';
import { allowMultipleRoles, allowAdminsOnly } from '../../controllers/auth/roles.controller';
import { USER_ROLES } from '../../models/user';

const {
  ADMIN, CATALYST, EDUCATOR, REVIEWER
} = USER_ROLES;

const router = Express.Router();

router.use(allowMultipleRoles([ADMIN, CATALYST, EDUCATOR, REVIEWER]));

/**
 * @api {get} /learning/content/rubrics Get all Rubrics
 * @apiDescription get all Rubrics
 * @apiHeader {String} authorization JWT Token.
 * @apiName GetRubrics
 * @apiGroup Rubrics
 */
router.get('/', getAllRubricsAPI);

/**
 * @api {get} /learning/content/rubrics/:id Get rubrics by ID
 * @apiDescription get  rubrics by ID
 * @apiHeader {String} authorization JWT Token.
 * @apiName GetRubrics
 * @apiGroup Rubrics
 */
router.get('/:id', getRubricsByIdAPI);

/**
 * @api {get} /learning/content/rubrics/program/:program Get rubrics by program
 * @apiDescription get rubrics by id
 * @apiHeader {String} authorization JWT Token.
 * @apiName GetRubrics
 * @apiGroup Rubrics
 */
router.get('/program/:id', getRubricsByProgramAPI);

/**
 * @api {get} /learning/content/rubrics/program/:program/milestone Get rubrics by Milestone
 * @apiDescription get rubrics by milestone
 * @apiHeader {String} authorization JWT Token.
 * @apiName GetRubrics
 * @apiGroup Rubrics
 */
router.get('/milestone/:id/', getRubricsByMilestoneAPI);

// Restrict modifications for any applicant to the cohorts
router.use(allowAdminsOnly);

/**
 * @api {post} /learning/content/rubrics/ Add Rubrics
 * @apiDescription Add a Rubric
 * @apiHeader {String} authorization JWT Token.
 * @apiName AddRubric
 * @apiGroup Rubrics

 * @apiParam {String} milestone_id  Milestone ID
 * @apiParam {String} rubric_name Name of the Rubric
 * @apiParam {String} program Program associated to
 * @apiParam {String} rubric_parameters json Rubric parameters
 */
router.post('/', createRubricsAPI);

/**
 * @api {patch} /learning/content/rubrics/:id  Update Rubrics
 * @apiDescription Update a Rubric
 * @apiHeader {String} authorization JWT Token.
 * @apiName UpdateRubric
 * @apiGroup Rubrics
 *
 * @apiParam {String} id Rubric ID
 * @apiParam {String} rubric_parameters json Rubric parameters
 */
router.patch('/:id', updateRubricsAPI);

/**
 * @api {delete} /learning/content/rubrics/:id Delete Rubric
 * @apiDescription Delete a Content Rubric
 * @apiHeader {String} authorization JWT Token.
 * @apiName DeleteRubric
 * @apiGroup Rubrics
 */
router.delete('/:id', deleteRubricAPI);

export default router;
