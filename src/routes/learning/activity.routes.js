import Express from 'express';
import challengeRouter from './activity_challenge.routes';
import milestoneRouter from './activity_milestone.routes';

const router = Express.Router();

router.use('/challenges', challengeRouter);
router.use('/milestones', milestoneRouter);

export default router;
