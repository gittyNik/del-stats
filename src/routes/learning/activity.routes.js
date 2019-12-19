import Express from 'express';
import challengeRouter from './activity_challenge.routes';
import milestoneRouter from './activity_milestone.routes';
import { allowSuperAdminOnly } from '../../controllers/auth/roles.controller';

const router = Express.Router();

// Disable until tested
router.use(allowSuperAdminOnly);

router.use('/challenges', challengeRouter);
router.use('/milestones', milestoneRouter);

export default router;
