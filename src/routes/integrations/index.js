import Express from 'express';
import slackRouter from './slack';
import instamojoRouter from './instamojo';
import { send404 } from '../../controllers/api.controller';

const router = Express.Router();

router.use('/slack', slackRouter);
router.use('/instamojo', instamojoRouter);
router.use('*', send404);

export default router;
