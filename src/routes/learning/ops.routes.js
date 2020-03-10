import Express from 'express';
import breakoutRouter from './ops_breakout.routes';
import reviewRouter from './ops_review.routes';
import assessmentRouter from './ops_assessment.routes';
import { allowSuperAdminOnly } from '../../controllers/auth/roles.controller';

const router = Express.Router();

router.use('/breakouts', breakoutRouter);

// Disable until tested
router.use(allowSuperAdminOnly);

router.use('/reviews', reviewRouter);
router.use('/assessments', assessmentRouter);

export default router;
