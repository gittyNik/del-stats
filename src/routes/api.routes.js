import Express from 'express';
import cohort from './cohort.routes';
import educator from './educator.routes';
import student from './student.routes';
import prompt from './prompt.routes';
import ping from './ping.routes';
import pingpong from './pingpong.routes';
import mailer from './mailer.routes';
import admin from './admin.routes';
import todo from './todo.routes';
import note from './note.routes';
<<<<<<< HEAD
import tepRouter from './tep.routes';
import user from './user.routes'
import {getProfile} from '../controllers/user.controller';
import { browserAccessControl, devOnly } from '../controllers/access_control.controller';
import authenticate from '../controllers/auth.controller';
import authRouter from './auth.routes';
=======
import link from './link.routes';
import user from './user.routes';
//import timedquiz from './timedquiz.routes';
import firewall from './firewall.routes';
import {getProfile, populateCurrentUser} from '../controllers/user.controller';
>>>>>>> 656bd58... integrated

const router = Express.Router();

// All routes
router.use(browserAccessControl);

// Public routes
router.use('/auth',authRouter);
router.use('/doc', devOnly, Express.static('./doc'));

// Private Routes
router.use(authenticate);
router.use('/profile', getProfile);
router.use('/tep', tepRouter);
router.use('/cohorts', cohort);

router.use('/educators', educator);
router.use('/students', student);
router.use('/prompts', prompt);
router.use('/pings', ping);
router.use('/pingpongs', pingpong);
router.use('/mailer', mailer);
router.use('/admin', admin);
router.use('/todos', todo);
router.use('/notes', note);
router.use('/users', user)
<<<<<<< HEAD
<<<<<<< HEAD
=======
router.use('/timedquiz', timedquiz);
=======
//router.use('/timedquiz', timedquiz);
>>>>>>> e16ffd1... final models??
router.use('/firewall', firewall);

router.get('/profile', populateCurrentUser, getProfile);
>>>>>>> 656bd58... integrated

router.get('/', (req, res) => res.send('API home'));
router.use('*', (req, res) => res.sendStatus(404));

export default router;
