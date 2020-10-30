import Express from 'express';
import applicationRouter from './application.routes';
import counsellorRouter from './counsellor.routes';
import jobRouter from './job_postings.routes';
import portfolioRouter from './portfolio.routes';
// import learnerRouter from './learner.routes';
import { allowSuperAdminOnly } from '../../controllers/auth/roles.controller';

const router = Express.Router();

// Disable until tested
router.use(allowSuperAdminOnly);

router.use('/applications', applicationRouter);
router.use('/counsellors', counsellorRouter);
router.use('/jobs', jobRouter);
router.use('/portfolios', portfolioRouter);
// router.use('/learners', learnerRouter);

export default router;
