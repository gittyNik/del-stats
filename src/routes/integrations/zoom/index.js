import Express from 'express';
import meetingRouter from '../../../integrations/zoom/meetings';
import zoomUserRouter from '../../../integrations/zoom/zoom_users';

const router = Express.Router();

router.use(Express.json({ limit: '20mb' }));
router.use(Express.urlencoded({ limit: '20mb', extended: false }));

router.use('/meeting', meetingRouter);
router.use('/users', zoomUserRouter);

export default router;
