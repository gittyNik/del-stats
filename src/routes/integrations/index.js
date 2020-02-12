import Express from 'express';
import slackRouter from './slack';
import instamojoRouter from './instamojo';
import hubspotRouter from './hubspot';
<<<<<<< HEAD
import githubRouter from './github';
=======
import zoomRouter from './zoom';
>>>>>>> 4a06a20... skeleton for zoom integration
import { send404, browserAccessControl } from '../../controllers/api.controller';

const router = Express.Router();

// All routes
router.use(browserAccessControl);

router.use('/slack', slackRouter);
router.use('/instamojo', instamojoRouter);
router.use('/hubspot', hubspotRouter);
<<<<<<< HEAD
router.use('/github', githubRouter);
=======
router.use('/zoom', zoomRouter);
>>>>>>> 4a06a20... skeleton for zoom integration
router.use('*', send404);

export default router;
