import Express from 'express';
import { serverSetupAPI } from '../handlers/guild.handler';

import authenticate from '../../../../controllers/auth/auth.controller';

const router = Express.Router();

router.use(authenticate);

router.post('/serverSetup', serverSetupAPI);

export default router;
