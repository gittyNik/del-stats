import Express from 'express';
import { notifyCatalyst, notifyRequest } from '../controllers/web.controller';
import authenticate from '../../../../controllers/auth/auth.controller';

const router = Express.Router();

router.use(authenticate);

router.post('/notify-catalyst-assignment', notifyCatalyst);

router.post('/notify-catalyst-request', notifyRequest);

export default router;
