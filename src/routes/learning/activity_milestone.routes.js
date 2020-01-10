import Express from 'express';
import {
  create, update, deleteOne, getAllByMilestone as getMilestoneResources,
  getAllMilestones, getMilestone, getTeam, getMilestoneTeams, resetMilestoneTeams,
} from '../../controllers/learning/milestone.controller';
import { apiNotReady } from '../../controllers/api.controller';


const router = Express.Router();

/**
 * @api {get} /learning/milestones/:milestone_id/teams Get milestone teams
 * @apiDescription Get teams in given cohort milestone.
 * @apiHeader {String} authorization JWT Token.
 * @apiName GetMilestoneTeams
 * @apiGroup MilestoneTeam
 *
 * @apiParam {String} milestone_id Id of Cohort milestone.
 */
router.get('/:milestone_id/teams', getMilestoneTeams);


/**
 * @api {patch} /learning/milestones/:milestone_id/teams Reset Milestone Teams
 * @apiHeader {String} authorization JWT Token.
 * @apiName Reset the milestone teams
 * @apiGroup MilestoneTeam
 *
 * @apiParam {String} milestone_id Id of Cohort milestone.
 */
router.patch(':/milestone_id/teams', resetMilestoneTeams);

/**
 * @api {get} /learning/milestones/:milestone_id/team Get team details
 * @apiHeader {String} authorization JWT Token.
 * @apiName GetMilestoneTeam
 * @apiGroup MilestoneTeam
 */
router.get('/:milestone_id/teams/:id', getTeam);

/**
 * @api {get} /learning/milestones/:milestone_id Get milestone by Id
 * @apiHeader {String} authorization JWT Token.
 * @apiName GetMilestoneById
 * @apiGroup TEP Milestone
 */
router.get('/', getAllMilestones);

/**
 * @api {get} /learning/milestones/:milestone_id Get milestone by Id
 * @apiHeader {String} authorization JWT Token.
 * @apiName GetMilestoneById
 * @apiGroup TEP Milestone
 */
router.get('/:milestone_id', getMilestone);

/**
 * @api {get} /learning/milestones/:milestone_id/resources Get TEP resources of a milestone
 * @apiHeader {String} authorization JWT Token.
 * @apiName GetMilestoneResources
 * @apiGroup TEP Milestone
 */
router.get('/:milestone_id/resources', getMilestoneResources);

/**
 * @api {post} learning/milestones Add a TEP Milestone
 * @apiHeader {String} authorization JWT Token.
 * @apiName AddNewMilestone
 * @apiGroup TEP Milestone
 *
 * @apiParam {String} name Name of the milestone
 */
router.post('/', create);

/**
 * @api {patch} /learning/milestones/:milestone_id Update TEP milestone
 * @apiHeader {String} authorization JWT Token.
 * @apiName Update
 * @apiGroup TEP Milestone
 *
 * @apiParam {String} milestone_name name of the milestone
 */
router.patch('/:milestone_id', update);

/**
 * @api {delete} /learning/milestones/:milestone_id Delete TEP milestone
 * @apiHeader {String} authorization JWT Token.
 * @apiName DeleteOne
 * @apiGroup TEP Milestone
 */
router.delete('/:milestone_id', deleteOne);

export default router;
