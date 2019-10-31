import Express from 'express';
import content from './content.routes';
import nudge from './nudge.routes';
import ops from './ops.routes';
import cohortRouter from './cohort.routes';
import programRouter from './program.routes';

const router = Express.Router();

router.use('/content', content);
router.use('/nudge', nudge);
router.use('/ops', ops);

router.use('/cohorts', cohortRouter);
router.use('/programs', programRouter);

router.use('/activity/challenges', challengeRouter);
router.use('/activity/milestones', milestoneRouter);

export default router;
