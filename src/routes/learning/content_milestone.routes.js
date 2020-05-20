import Express from 'express';
import {
  getAllMilestones, createMilestone, updateMilestone, deleteMilestone,
} from '../../controllers/learning/milestone.controller';
import {
  getCohortMilestonesByUserId,
  getCohortMilestoneWithDetails,
} from '../../controllers/learning/cohort_milestone.controller';
import { allowMultipleRoles, allowAdminsOnly } from '../../controllers/auth/roles.controller';
import { USER_ROLES } from '../../models/user';


const router = Express.Router();

const {
  ADMIN, CATALYST, EDUCATOR, LEARNER,
} = USER_ROLES;

router.use(allowMultipleRoles([ADMIN, CATALYST, EDUCATOR, LEARNER]));
/**
 * @api {get} /learning/content/milestones/:milestone_id Get Content Milestone
 * @apiDescription get Content Milestone
 * @apiHeader {String} authorization JWT Token.
 * @apiName GetContentMilestone
 * @apiGroup ContentMilestone
 */
router.get('/:milestone_id', getCohortMilestoneWithDetails);

/**
 * @api {get} /learning/content/milestones/:milestone_id Get Content Milestone
 * @apiDescription get Content Milestone
 * @apiHeader {String} authorization JWT Token.
 * @apiName GetContentMilestone
 * @apiGroup ContentMilestone
 */
router.get('/:milestone_id', getCohortMilestoneWithDetails);

/**
 * @api {get} /learning/content/milestones Get all Content Milestones
 * @apiDescription get all Content Milestones
 * @apiHeader {String} authorization JWT Token.
 * @apiName GetContentMilestones
 * @apiGroup ContentMilestones
 */
router.get('/', getAllMilestones);

router.get('/user/:user_id', getCohortMilestonesByUserId);

// Restrict modifications for any applicant to the cohorts
router.use(allowAdminsOnly);

/**
 * @api {post} /learning/content/milestones/ Add Content Milestone
 * @apiDescription Add a Content Milestone
 * @apiHeader {String} authorization JWT Token.
 * @apiName AddContentMilestone
 * @apiGroup ContentMilestone
 *
 * @apiParam {String} name Name of the milestone.
 * @apiParam {Object} prerequisite_milestones Prerequisite Milestones for this milestone.
 * @apiParam {String} problem_statement Problem statement for the milestone.
 * @apiParam {Object} learning_competencies: Learning Competencies of the milestone.
 * @apiParam {String} guidelines: Guidelines of the milestone.
 */
router.post('/', createMilestone);

/**
 * @api {patch} /learning/content/milestones/:id  Update Content Milestone
 * @apiDescription Update a Content Milestone
 * @apiHeader {String} authorization JWT Token.
 * @apiName UpdateContentMilestone
 * @apiGroup ContentMilestone
 *
 * @apiParam {String} name Name of the milestone.
 * @apiParam {Object} prerequisite_milestones Array of Prerequisite Milestones id's.
 * @apiParam {String} problem_statement Problem statement for the milestone.
 * @apiParam {Object} learning_competencies Learning Competencies of the milestone.
 * @apiParam {String} guidelines Guidelines of the milestone.
 */
router.patch('/:id', updateMilestone);

/**
 * @api {delete} /learning/content/milestones/:id Delete Content Milestone
 * @apiDescription Delete a Content Milestone
 * @apiHeader {String} authorization JWT Token.
 * @apiName DeleteContentMilestone
 * @apiGroup ContentMilestone
 */
router.delete('/:id', deleteMilestone);

export default router;
