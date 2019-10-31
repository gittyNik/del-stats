import Express from 'express';
import pingRouter from './nudge_ping.routes';
import pongRouter from './nudge_pong.routes';
import templateRouter from './nudge_template.routes';

const router = Express.Router();

router.use('/pings', pingRouter);
router.use('/pongs', pongRouter);
router.use('/templates', templateRouter);

export default router;
