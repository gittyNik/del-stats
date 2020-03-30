import Express from 'express';
import sendRouter from './send';
import authenticate from '../../controllers/auth/auth.controller';
// import { allowSuperAdminOnly } from '../../controllers/auth/roles.controller';

const router = Express.Router();

router.use(authenticate);
// router.use(allowSuperAdminOnly);

router.use('/send', sendRouter);

export default router;
