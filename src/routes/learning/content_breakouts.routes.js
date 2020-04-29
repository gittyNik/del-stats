import Express from 'express';
import breakoutRouter from './content_breakout_cohort.routes';
import breakoutRecordingsRouter from './content_breakout_recordings.routes';

const router = Express.Router();

router.use('/cohort', breakoutRouter);
router.use('/recordings', breakoutRecordingsRouter);

export default router;
