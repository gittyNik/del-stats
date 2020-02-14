import Express from 'express';
import commitRouter from './commits.router.js';

const router = Express.Router();

// Returns latest commit object of given user {{username}} in repository {{repo_name}}
router.use('/commits', commitRouter);

export default router;