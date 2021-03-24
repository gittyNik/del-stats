import Express from 'express';
import breakoutRouter from './ops_breakout.routes';
import reviewRouter from './ops_review.routes';
import assessmentRouter from './ops_assessment.routes';
import authenticate from '../../controllers/auth/auth.controller';

const router = Express.Router();
router.use(authenticate);

router.use('/breakouts', breakoutRouter);
router.use('/reviews', reviewRouter);
router.use('/assessments', assessmentRouter);

export default router;
