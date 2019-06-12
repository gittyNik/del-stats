import Express from 'express';
import {getAllByMilestone as getMilestoneResources } from '../controllers/tep_resource.controller';

const router = Express.Router();

/**
 * @api {get} /tep/milestones/:milestone_id/resources Get TEP resources of a milestone
 * @apiHeader {String} authorization JWT Token.
 * @apiName GetMilestoneResources
 * @apiGroup TepMilestones
 */
router.get('/:milestone_id/resources', getMilestoneResources);

export default router;