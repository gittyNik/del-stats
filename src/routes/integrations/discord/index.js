import Express from 'express';
import deltaApp from '../../../integrations/discord/delta-app';

const router = Express.Router();

router.use('/delta', deltaApp);

export default router;
