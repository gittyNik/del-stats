import Express from 'express';
import compression from 'compression';
import slackRouter from './slack';
import discordRouter from './discord';
import instamojoRouter from './instamojo';
import hubspotRouter from './hubspot';
import twitterRouter from './twitter';
import githubRouter from './github';
import zoomRouter from './zoom';
import codeSandboxRouter from './code_sandbox';
import calendarRouter from './calendar';
import { send404, browserAccessControl } from '../../controllers/api.controller';

const router = Express.Router();

// All routes
router.use(browserAccessControl);

router.use('/slack', slackRouter);

router.use(compression());
router.use(Express.json({ limit: '20mb' }));
router.use(Express.urlencoded({ limit: '20mb', extended: false }));

router.use('/discord', discordRouter);
router.use('/instamojo', instamojoRouter);
router.use('/hubspot', hubspotRouter);
router.use('/twitter', twitterRouter);
router.use('/github', githubRouter);
router.use('/zoom', zoomRouter);
router.use('/code', codeSandboxRouter);
router.use('/calendar', calendarRouter);

router.use('*', send404);

export default router;
