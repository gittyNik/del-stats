import Express from 'express';
import applicationRouter from './application.routes';
import counsellorRouter from './counsellor.routes';
import jobRouter from './job.routes';
import portfolioRouter from './portfolio.routes';

const router = Express.Router();

router.use('/applications', applicationRouter);
router.use('/counsellors', counsellorRouter);
router.use('/jobs', jobRouter);
router.use('/portfolios', portfolioRouter);

export default router;
