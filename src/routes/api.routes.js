import Express from 'express';
import cohortRouter from './cohort.routes';
import educator from './educator.routes';
import student from './student.routes';
import socialConnectionRouter from './social_connection.routes';
import ping from './ping.routes';
import pingpong from './pingpong.routes';
import mailer from './mailer.routes';
import adminRouter from './admin.routes';
import todo from './todo.routes';
import note from './note.routes';
import tepRouter from './tep.routes';
import user from './user.routes';
import chromehistory from './browser-history.routes';
import { getProfile } from '../controllers/user.controller';
import { browserAccessControl, devOnly } from '../controllers/access_control.controller';
import authenticate from '../controllers/auth.controller';
import authRouter from './auth.routes';
import firewallRouter from './firewall.routes';


const router = Express.Router();

// All routes
router.use(browserAccessControl);

// Public routes
router.use('/auth', authRouter);
router.use('/doc', devOnly, Express.static('./doc'));

// Partially private routes
router.use('/firewall', firewallRouter);

// Completely private routes
router.use(authenticate);
router.use('/profile', getProfile);
router.use('/tep', tepRouter);
router.use('/cohorts', cohortRouter);
router.use('/browser-history', chromehistory);
router.use('/admin', adminRouter);
router.use('/social_connections', socialConnectionRouter);

router.use('/educators', educator);
router.use('/students', student);
router.use('/pings', ping);
router.use('/pingpongs', pingpong);
router.use('/mailer', mailer);
router.use('/todos', todo);
router.use('/notes', note);
router.use('/users', user);

router.get('/', (req, res) => res.send('API home'));
router.use('*', (req, res) => res.sendStatus(404));

export default router;
