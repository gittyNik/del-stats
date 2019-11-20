import Express from 'express';
import { eventListener, interactionListener } from '../../../controllers/integrations/slack/team-app';

const router = Express.Router();

router.use('/action-endpoint', eventListener);
router.use('/interactive-endpoint', interactionListener);

export default router;
