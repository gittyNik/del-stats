import Express from 'express';
import {
  createMilestoneTeamsbyCohortMilestoneId,
  addTeamAccessRepo,
} from '../../../integrations/github/controllers';

const router = Express.Router();

router.post('/addTeam', addTeamAccessRepo);
// Returns latest commit object of given user {{username}} in repository {{repo_name}}
router.post('/:cohort_milestone_id', createMilestoneTeamsbyCohortMilestoneId);

export default router;
