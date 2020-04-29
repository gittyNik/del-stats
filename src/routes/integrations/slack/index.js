import Express from 'express';
import deltaApp from '../../../integrations/slack/delta-app';
import teamApp from '../../../integrations/slack/team-app';

const router = Express.Router();

router.use('/delta', deltaApp);
router.use('/team', teamApp);

export default router;