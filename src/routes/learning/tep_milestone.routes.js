import Express from 'express';
import {
  create, update, deleteOne, getAllByMilestone as getMilestoneResources,
  getAllMilestones, getMilestone, getTeam, createTeam, updateTeam, deleteTeam,
} from '../../controllers/tep_milestone.controller';

const router = Express.Router();

/**
 * @api {get} /tep/milestones/team/:team_id Get teams
 * @apiHeader {String} authorization JWT Token.
 * @apiName GetTeam
 * @apiGroup TEP Team
 */
router.get('/team/:team_id', getTeam);

/**
 * @api {post} /tep/milestones/team Add a Team
 * @apiHeader {String} authorization JWT Token.
 * @apiName AddNewTeam
 * @apiGroup TEP Team
 *
 * @apiParam {String} name Name of the team
 */
router.post('/team', createTeam);

/**
 * @api {patch} /tep/milestones/team/:team_id Update Team
 * @apiHeader {String} authorization JWT Token.
 * @apiName Update
 * @apiGroup TEP Team
 *
 * @apiParam {String} team_name name of the team
 */
router.patch('/team/:team_id', updateTeam);

/**
 * @api {delete} /tep/milestones/team/:team_id Delete a Team
 * @apiHeader {String} authorization JWT Token.
 * @apiName DeleteOne
 * @apiGroup TEP Team
 */
router.delete('/team/:team_id', deleteTeam);

/**
 * @api {get} /tep/milestones Get all TEP milestones
 * @apiHeader {String} authorization JWT Token.
 * @apiName GetMilestones
 * @apiGroup TEP Milestone
 */
router.get('/', getAllMilestones);

/**
 * @api {get} /tep/milestones/:milestone_id Get milestone by Id
 * @apiHeader {String} authorization JWT Token.
 * @apiName GetMilestoneById
 * @apiGroup TEP Milestone
 */
router.get('/:milestone_id', getMilestone);

/**
 * @api {get} /tep/milestones/:milestone_id/resources Get TEP resources of a milestone
 * @apiHeader {String} authorization JWT Token.
 * @apiName GetMilestoneResources
 * @apiGroup TEP Milestone
 */
router.get('/:milestone_id/resources', getMilestoneResources);

/**
 * @api {post} /tep/milestones Add a TEP Milestone
 * @apiHeader {String} authorization JWT Token.
 * @apiName AddNewMilestone
 * @apiGroup TEP Milestone
 *
 * @apiParam {String} name Name of the milestone
 */
router.post('/', create);

/**
 * @api {patch} /tep/milestones/:milestone_id Update TEP milestone
 * @apiHeader {String} authorization JWT Token.
 * @apiName Update
 * @apiGroup TEP Milestone
 *
 * @apiParam {String} milestone_name name of the milestone
 */
router.patch('/:milestone_id', update);

/**
 * @api {delete} /tep/milestones/:milestone_id Delete TEP milestone
 * @apiHeader {String} authorization JWT Token.
 * @apiName DeleteOne
 * @apiGroup TEP Milestone
 */
router.delete('/:milestone_id', deleteOne);

export default router;
