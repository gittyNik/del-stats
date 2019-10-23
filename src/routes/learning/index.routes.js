import Express from 'express';
import content from './content.routes';
import nudge from './nudge.routes';
import breakoutRouter from './breakout.routes';
import challengeRouter from './challenge.routes';
import cohortRouter from './cohort.routes';
import educatorRouter from './educator.routes';
import learnerRouter from './learner.routes';
import milestoneRouter from './milestone.routes';
import programRouter from './program.routes';
import resourceRouter from './resource.routes';

const router = Express.Router();

router.use('/nudge', nudge);
router.use('/content', content);

router.use('/breakouts', breakoutRouter);
router.use('/challenges', challengeRouter);
router.use('/cohorts', cohortRouter);
router.use('/educators', educatorRouter);
router.use('/milestones', milestoneRouter);
router.use('/programs', programRouter);

export default router;
