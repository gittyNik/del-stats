import Express from 'express';
import { createMeeting, userInfo } from '../../../integrations/zoom/meetings.controller';

const router = Express.Router();

router.use(Express.urlencoded({ limit: '20mb', extended: false }));
router.get('/meeting', createMeeting);
router.get('/users', userInfo);

export default router;
