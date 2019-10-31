import Express from 'express';
import milestoneTeamRouter from './milestone_team.routes';
import {
  create, update, deleteOne, getAllByMilestone as getMilestoneResources,
  getAllMilestones, getMilestone, getTeam, createTeam, updateTeam, deleteTeam,
} from '../../controllers/learning/milestone.controller';

const router = Express.Router();

router.use('/:milestone_id/teams', milestoneTeamRouter);

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
