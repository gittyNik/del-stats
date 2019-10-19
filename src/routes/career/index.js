import Express from 'express';
import applicationRouter from './application.routes';
import counsellorRouter from './counsellor.routes';
import jobRouter from './job.routes';

const router = Express.Router();

router.use('/applications', applicationRouter);
router.use('/counsellors', counsellorRouter);
router.use('/jobs', jobRouter);

export default router;
