import Express from 'express';
import { userInfo } from './zoom_users.controller';

const router = Express.Router();

router.use('/', userInfo);

export default router;
