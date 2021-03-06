import Express from 'express';
import {
  create, update, deleteOne, getAllByMilestone as getMilestoneResources,
  getAllMilestones, getMilestone, getTeam, getMilestoneTeams, resetMilestoneTeams,
  generateMilestoneTeams,
} from '../../controllers/learning/milestone.controller';
import {
  getCohortLiveMilestone, getAllCohortMilestones,
  getCohortMilestoneStats,
} from '../../controllers/learning/cohort_milestone.controller';
import {
  allowMultipleRoles,
  allowAdminsOnly,
} from '../../controllers/auth/roles.controller';
import { USER_ROLES } from '../../models/user';

const {
  ADMIN, CATALYST, EDUCATOR, LEARNER,
} = USER_ROLES;

const router = Express.Router();

router.use(allowMultipleRoles([ADMIN, CATALYST, EDUCATOR, LEARNER]));

/**
 * @api {get} /learning/activity/milestones/:milestone_id/teams Get milestone teams
 * @apiDescription Get teams in given cohort milestone.
 * @apiHeader {String} authorization JWT Token.
 * @apiName GetMilestoneTeams
 * @apiGroup MilestoneTeam
 *
 * @apiParam {String} milestone_id Id of Cohort milestone.
 */
router.get('/:milestone_id/teams', getMilestoneTeams);

/**
 * @api {get} /learning/activity/milestones/:milestone_id/teams Create milestone teams
 * @apiDescription Create teams in given cohort milestone.
 * @apiHeader {String} authorization JWT Token.
 * @apiName CreateMilestoneTeams
 * @apiGroup MilestoneTeam
 *
 * @apiParam {String} milestone_id Id of Cohort milestone.
 */
router.post('/:milestone_id/teams', generateMilestoneTeams);

/**
 * @api {patch} /learning/activity/milestones/:milestone_id/teams Reset Milestone Teams
 * @apiHeader {String} authorization JWT Token.
 * @apiName Reset the milestone teams
 * @apiGroup MilestoneTeam
 */
router.patch('/:milestone_id/teams', resetMilestoneTeams);

/**
 * @api {get} /learning/activity/milestones/:milestone_id/team Get team details
 * @apiHeader {String} authorization JWT Token.
 * @apiName GetMilestoneTeam
 * @apiGroup MilestoneTeam
 */
router.get('/:milestone_id/teams/:id', getTeam);

/**
 * @api {get} /learning/activity/milestones/:milestone_id Get milestone by Id
 * @apiHeader {String} authorization JWT Token.
 * @apiName GetMilestoneById
 * @apiGroup TEP Milestone
 */
router.get('/', getAllMilestones);

/**
 * @api {get} /learning/activity/milestones/:milestone_id Get milestone by Id
 * @apiHeader {String} authorization JWT Token.
 * @apiName GetMilestoneById
 * @apiGroup TEP Milestone
 */
router.get('/:milestone_id', getMilestone);

/**
 * @api {get} /learning/activity/milestones/:milestone_id/resources Get TEP resources of a milestone
 * @apiHeader {String} authorization JWT Token.
 * @apiName GetMilestoneResources
 * @apiGroup TEP Milestone
 */
router.get('/:milestone_id/resources', getMilestoneResources);

/**
 * @api {get} /learning/activity/milestones/:milestone_id Get milestone by Id
 * @apiHeader {String} authorization JWT Token.
 * @apiName GetMilestoneById
 * @apiGroup TEP Milestone
 */
router.get('/cohort/:cohort_id', getAllCohortMilestones);

router.get('/cohort/:cohort_id/live', getCohortLiveMilestone);

router.get('/cohort/:cohort_milestone_id/stats', getCohortMilestoneStats);

// Restrict modifications for any applicant to the cohorts
router.use(allowAdminsOnly);

/**
 * @api {post} learning/activity/milestones Add a TEP Milestone
 * @apiHeader {String} authorization JWT Token.
 * @apiName AddNewMilestone
 * @apiGroup TEP Milestone
 *
 * @apiParam {String} name Name of the milestone
 */
router.post('/', create);

/**
 * @api {patch} /learning/activity/milestones/:milestone_id Update TEP milestone
 * @apiHeader {String} authorization JWT Token.
 * @apiName Update
 * @apiGroup TEP Milestone
 *
 * @apiParam {String} milestone_name name of the milestone
 */
router.patch('/:milestone_id', update);

/**
 * @api {delete} /learning/activity/milestones/:milestone_id Delete TEP milestone
 * @apiHeader {String} authorization JWT Token.
 * @apiName DeleteOne
 * @apiGroup TEP Milestone
 */
router.delete('/:milestone_id', deleteOne);

/**
 * @api {get} /learning/activity/milestones/cohort/:cohort_id/live Get Current Milestone of Cohort
 * @apiHeader {String} authorization JWT Token.
 * @apiName GetCurrentMilestoneOfCohort
 * @apiGroup TEP Milestone
 */

export default router;
