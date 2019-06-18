import Express from 'express';
import {create,getAllByMilestone as getMilestoneResources} from '../controllers/tep_milestone.controller';

const router = Express.Router();

/**
 * @api {get} /tep/milestones/:milestone_id/resources Get TEP resources of a milestone
 * @apiHeader {String} authorization JWT Token.
 * @apiName GetMilestoneResources
 * @apiGroup TepMilestones
 */
router.get('/:milestone_id/resources', getMilestoneResources);

/**
 * @api {post} /tep/milestones Add a TEP Topic
 * @apiHeader {String} authorization JWT Token.
 * @apiName AddNewMilestone
 * @apiGroup TepMilestone
 *
 * @apiParam {String} title Title of the milestone
 * @apiParam {String} description Description of the milestone
 */
router.post('/', create);

export default router;
