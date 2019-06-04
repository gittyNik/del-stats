import Express from 'express';
import authentication from './auth.routes';
import cohort from './cohort.routes';
import educator from './educator.routes';
import student from './student.routes';
import prompt from './prompt.routes';
import ping from './ping.routes';
import pingpong from './pingpong.routes';
import mailer from './mailer.routes';
import days from './day.routes';
import admin from './admin.routes';
import todo from './todo.routes';
import note from './note.routes';
import link from './link.routes';
import user from './user.routes'
import {getProfile, populateCurrentUser} from '../controllers/user.controller';

const router = Express.Router();
// api doc is accessible in development environment only
if(process.env.NODE_ENV === 'development') {
	router.use('/doc', Express.static('./doc'));
}
router.use('/tep', link);
router.use(authentication);

router.use('/cohorts', cohort);
router.use('/educators', educator);
router.use('/students', student);
router.use('/prompts', prompt);
router.use('/pings', ping);
router.use('/pingpongs', pingpong);
router.use('/mailer', mailer);
router.use('/days', days);
router.use('/admin', admin);
router.use('/todos', todo);
router.use('/notes', note);
router.use('/users', user)


router.get('/profile', populateCurrentUser, getProfile);

router.get('/', (req, res) => res.send('API home'));
router.use('*', (req, res) => res.sendStatus(404));

export default router;
