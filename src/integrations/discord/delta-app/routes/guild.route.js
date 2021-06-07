import Express from 'express';
import { serverSetupAPI } from '../handlers/guild.handler';

const router = Express.Router();

router.post('/serverSetup', serverSetupAPI);

export default router;
