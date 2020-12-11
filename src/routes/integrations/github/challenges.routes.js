import Express from 'express';
import { createChallenge, checkRepoExist } from '../../../integrations/github/controllers';
import { allowMultipleRoles } from '../../../controllers/auth/roles.controller';
import { USER_ROLES } from '../../../models/user';

const {
  ADMIN, RECRUITER, CAREER_SERVICES, EDUCATOR, LEARNER,
} = USER_ROLES;

const router = Express.Router();

router.use(allowMultipleRoles([ADMIN, RECRUITER, CAREER_SERVICES, EDUCATOR, LEARNER]));

// Returns latest commit object of given user {{username}} in repository {{repo_name}}
router.post('/:id', createChallenge);

router.get('/find', checkRepoExist);

export default router;
