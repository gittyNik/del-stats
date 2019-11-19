import Express from 'express';
import { eventListener, interactionListener } from '../../controllers/integrations/slack';

const router = Express.Router();

router.use('/action-endpoint', eventListener);
router.use('/interactive-endpoint', interactionListener);

export default router;
