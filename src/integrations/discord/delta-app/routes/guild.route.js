import Express from 'express';
import serverSetupAPI from '../handlers/guild.handler';

import authenticate from '../../../../controllers/auth/auth.controller';
import { allowSuperAdminOnly } from '../../../../controllers/auth/roles.controller';

const router = Express.Router();

router.use(authenticate);

router.get('/serverSetup', serverSetupAPI);

export default router;
