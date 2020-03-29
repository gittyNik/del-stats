import Express from 'express';
import sendEmailerRouter from './send_emailer';
import authenticate from '../../../controllers/auth/auth.controller';

const router = Express.Router();

router.use(authenticate);

router.use('/send', sendEmailerRouter);

export default router;
