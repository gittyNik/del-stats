import Express from 'express';
import { createMilestoneTeamsbyCohortMilestoneId } from '../../../integrations/github/controllers';

const router = Express.Router();

// Returns latest commit object of given user {{username}} in repository {{repo_name}}
router.post('/:cohort_milestone_id', createMilestoneTeamsbyCohortMilestoneId);

export default router;

