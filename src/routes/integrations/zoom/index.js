import Express from 'express';
import meetingRouter from './meetings';
import zoomUserRouter from './zoom_users';
import authenticate from '../../../controllers/auth/auth.controller';

const router = Express.Router();

router.use(authenticate);

router.use(Express.json({ limit: '20mb' }));
router.use(Express.urlencoded({ limit: '20mb', extended: false }));

router.use('/meeting', meetingRouter);
router.use('/users', zoomUserRouter);

export default router;
