import Express from 'express';
import { createChallenge } from '../../../integrations/github/controllers';

const router = Express.Router();

// Returns latest commit object of given user {{username}} in repository {{repo_name}}
router.post('/:id', createChallenge);

export default router;

