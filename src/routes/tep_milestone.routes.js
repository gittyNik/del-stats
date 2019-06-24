import Express from 'express';
import {create,update,deleteOne,getAllByMilestone as getMilestoneResources,getAllMilestones,getMilestone} from '../controllers/tep_milestone.controller';

const router = Express.Router();

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
