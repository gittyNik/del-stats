import Express from 'express';
import slackRouter from './slack';
import instamojoRouter from './instamojo';
import hubspotRouter from './hubspot';
import { send404, browserAccessControl } from '../../controllers/api.controller';

const router = Express.Router();

// All routes
router.use(browserAccessControl);

router.use('/slack', slackRouter);
router.use('/instamojo', instamojoRouter);
router.use('/hubspot', hubspotRouter);
router.use('*', send404);

export default router;
