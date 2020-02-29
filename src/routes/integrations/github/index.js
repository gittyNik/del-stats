import Express from 'express';
import challengesRouter from './challenges.routes.js';
import statsRouter from './stats.routes.js';
import commitRouter from './commits.routes.js';
import milestonesRouter from './milestones.routes.js';
import authenticate from '../../../controllers/auth/auth.controller';

const router = Express.Router();

router.use('/milestones', milestonesRouter);

// Returns latest commit object of given user {{username}} in repository {{repo_name}}
router.use('/commits', commitRouter);

router.use(authenticate);

router.use('/challenges', challengesRouter);

router.use('/stats', statsRouter);

export default router;