import Express from 'express';
import { userInfo } from '../../../../integrations/zoom/zoom_users/zoom_users.controller';

const router = Express.Router();

router.use('/', userInfo);

export default router;
