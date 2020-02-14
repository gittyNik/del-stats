import Express from 'express';
import challengesRouter from './challenges.router.js';

const router = Express.Router();

// Returns latest commit object of given user {{username}} in repository {{repo_name}}
router.use('/commits', commitRouter);

router.use('/challenges', challengesRouter);

export default router;