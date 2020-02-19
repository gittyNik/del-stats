import Express from 'express';
import challengesRouter from './challenges.routes.js';
import statsRouter from './stats.routes.js';
import commitRouter from './commits.routes.js';

const router = Express.Router();

// Returns latest commit object of given user {{username}} in repository {{repo_name}}
router.use('/commits', commitRouter);

router.use('/challenges', challengesRouter);

router.use('/stats', statsRouter);
export default router;