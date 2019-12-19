import Express from 'express';
import pingRouter from './nudge_ping.routes';
import pongRouter from './nudge_pong.routes';
import templateRouter from './nudge_template.routes';
import { allowSuperAdminOnly } from '../../controllers/auth/roles.controller';

const router = Express.Router();

// Disable until tested
router.use(allowSuperAdminOnly);

router.use('/pings', pingRouter);
router.use('/pongs', pongRouter);
router.use('/templates', templateRouter);

export default router;
