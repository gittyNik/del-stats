import Express from 'express';
import interactionController from '../../../controllers/integrations/slack/team-app/interaction.controller';
import eventController from '../../../controllers/integrations/slack/team-app/event.controller';

const router = Express.Router();

router.use('/action-endpoint', eventController);
router.use('/interactive-endpoint', interactionController);
// router.use('/command-endpoint', commandController);
// router.use('/options-endpoint', optionsController);

export default router;
