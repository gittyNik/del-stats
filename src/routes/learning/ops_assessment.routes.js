import Express from 'express';
import {
  getAllAssessmentsAPI, getAssessmentsByIdAPI, getAssessmentsByStatusAPI,
  getAssessmentsByTeamAPI, getAssessmentsByUserIdAPI,
  createAssessment, addAssessmentsForTeamAPI,
  createAssessmentScheduleAPI,
  getUserAndTeamAssessmentsAPI,
  updateAssessmentForLearnerAPI,
} from '../../controllers/learning/assessment.controller';
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
 * @api {get} /learning/ops/assessments Get all Assessments
 * @apiDescription get all Assessments
 * @apiHeader {String} authorization JWT Token.
 * @apiName GetAssessments
 * @apiGroup Assessments
 */
router.get('/', getAllAssessmentsAPI);

/**
 * @api {get} /learning/ops/assessments/:id Get assessments for Team
 * @apiDescription get a document for Team
 * @apiHeader {String} authorization JWT Token.
 * @apiName GetAssessments
 * @apiGroup Assessments
 */
router.get('/:id', getAssessmentsByTeamAPI);

/**
 * @api {get} /learning/ops/assessments/assessment/:id/ Get assessment by id
 * @apiDescription get assessment by id
 * @apiHeader {String} authorization JWT Token.
 * @apiName GetAssessments
 * @apiGroup Assessments
 */
router.get('/assessment/:id', getAssessmentsByIdAPI);

/**
 * @api {get} /learning/ops/assessments/user/ Get assessment for user
 * @apiDescription get assessment for user
 * @apiHeader {String} authorization JWT Token.
 * @apiName GetAssessmentsForUser
 * @apiGroup Assessments
 */
router.get('/user/:id', getAssessmentsByUserIdAPI);

/**
 * @api {get} /learning/ops/assessments/user/team Get assessment for users
 * @apiDescription get assessment for user
 * @apiHeader {String} authorization JWT Token.
 * @apiName GetAssessmentsForUser
 * @apiGroup Assessments
 */
router.get('/user/team/:id', getUserAndTeamAssessmentsAPI);

/**
 * @api {get} /learning/ops/assessments/status/:id/ Get Assessments by status
 * @apiDescription get Assessments by status
 * @apiHeader {String} authorization JWT Token.
 * @apiName GetAssessmentsByStatus
 * @apiGroup Assessments
 */
router.get('/status/:id', getAssessmentsByStatusAPI);

// Restrict modifications for any applicant to the cohorts
router.use(allowAdminsOnly);

/**
 * @api {post} /learning/ops/assessments/schedule Schedule Assessments
 * @apiDescription schedule Assessments by status
 * @apiHeader {String} authorization JWT Token.
 * @apiName ScheduleAssessments
 * @apiGroup Assessments
 *
 * @apiParam {String} Program name
 */
router.post('/schedule', createAssessmentScheduleAPI);

/**
 * @api {post} /learning/ops/assessments/ Add Team Assessments
 * @apiDescription Add a Teams Assessment
 * @apiHeader {String} authorization JWT Token.
 * @apiName AddTeamAssessment
 * @apiGroup Assessments

 * @apiParam {String} id Team Milestone ID
 * @apiParam {String} milestone_name Description of the topic
 * @apiParam {String} status Status of assessment
 * @apiParam {String} scheduled_at scheduled date time
 * @apiParam {String} call_details json call details
 * @apiParam {String} zoom_url join url for Zoom call
 */
router.post('/', createAssessment);

/**
 * @api {patch} /learning/ops/assessments/:id/:learner_id  Update Team Assessments
 * @apiDescription Update a Learner Assessment
 * @apiHeader {String} authorization JWT Token.
 * @apiName UpdateLearnerAssessment
 * @apiGroup Assessments
 *
 * @apiParam {String} id Cohort breakout ID
 * @apiParam {String} learner_id Learner ID
 * @apiParam {String} assessment_feedback Object of rubric key and score
 * @apiParam {String} learner_feedback Notes by Assessmenter for Learner
 */
router.patch('/:id/:learner_id', updateAssessmentForLearnerAPI);

/**
 * @api {patch} /learning/ops/assessments/:id  Update Team Assessments
 * @apiDescription Update a Team Assessment
 * @apiHeader {String} authorization JWT Token.
 * @apiName UpdateTeamAssessment
 * @apiGroup Assessments
 *
 * @apiParam {String} id Team Milestone ID
 * @apiParam {String} learner_feedbacks Array of Learner feedbacks
 * @apiParam {String} team_feedback Team Feedbackx
 * @apiParam {String} status ID of the Milestone
 * @apiParam {String} additional_details Details regarding the assessment
 */
router.patch('/:id', addAssessmentsForTeamAPI);

/**
 * @api {delete} /learning/ops/topics/:id Delete Content Topic
 * @apiDescription Delete a Content Topic
 * @apiHeader {String} authorization JWT Token.
 * @apiName DeleteUserDocument
 * @apiGroup Assessments
 */
// router.delete('/:id', deleteOne);

export default router;
