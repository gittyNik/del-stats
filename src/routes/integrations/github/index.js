import Express from 'express';
import challengesRouter from './challenges.routes';
import statsRouter from './stats.routes';
import commitRouter from './commits.routes';
import milestonesRouter from './milestones.routes';
import authenticate from '../../../controllers/auth/auth.controller';

const router = Express.Router();

router.use(authenticate);

router.use('/milestones', milestonesRouter);

// Returns latest commit object of given user {{username}} in repository {{repo_name}}
router.use('/commits', commitRouter);

router.use('/challenges', challengesRouter);

router.use('/stats', statsRouter);

export default router;
