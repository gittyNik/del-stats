import Express from 'express';
import slackRouter from './slack';

const router = Express.Router();

router.use('/slack', slackRouter);
router.use('*', send404);

export default router;
