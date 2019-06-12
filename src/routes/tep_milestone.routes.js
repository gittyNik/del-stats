import Express from 'express';
import {getAllByMilestone as getMilestoneResources } from '../controllers/tep_resource.controller';

const router = Express.Router();

router.get('/:milestone_id/resources', getMilestoneResources);

export default router;