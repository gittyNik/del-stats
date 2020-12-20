import Express from 'express';
import {
  createMilestoneTeamsbyCohortMilestoneId,
  addTeamAccessRepo,
} from '../../../integrations/github/controllers';

import {
  allowMultipleRoles,
} from '../../../controllers/auth/roles.controller';
import { USER_ROLES } from '../../../models/user';

const {
  ADMIN, LEARNER, OPERATIONS,
} = USER_ROLES;

const router = Express.Router();

router.use(allowMultipleRoles([ADMIN, LEARNER, OPERATIONS]));

router.post('/addTeam', addTeamAccessRepo);
// Returns latest commit object of given user {{username}} in repository {{repo_name}}
router.post('/:cohort_milestone_id', createMilestoneTeamsbyCohortMilestoneId);

export default router;
