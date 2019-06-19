import Express from 'express';
import {create,getAllByMilestone as getMilestoneResources} from '../controllers/tep_milestone.controller';

const router = Express.Router();

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
 * @apiParam {String[]} topics UUID Array of the milestone
 */
router.post('/', create);

export default router;
