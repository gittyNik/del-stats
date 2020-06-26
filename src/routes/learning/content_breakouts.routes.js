import Express from 'express';
import breakoutRouter from './content_breakout_cohort.routes';
import breakoutRecordingsRouter from './content_breakout_recordings.routes';
import breakoutTemplateRouter from './content_breakout_template.routes';
import learnerBreakout from './learner_breakout.routes';

const router = Express.Router();

router.use('/cohort', breakoutRouter);
router.use('/learner', learnerBreakout);
router.use('/recordings', breakoutRecordingsRouter);
router.use('/templates', breakoutTemplateRouter);

export default router;
