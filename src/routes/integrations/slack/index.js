import Express from 'express';
import deltaRouter from './delta.routes';
import teamRouter from './team.routes';

const router = Express.Router();

router.use('/delta', deltaRouter);
router.use('/team', teamRouter);

export default router;
