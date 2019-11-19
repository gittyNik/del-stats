import Express from 'express';
import { interactionListener, actionListener } from '../../controllers/integrations/slack';
import { createMessageAdapter } from '@slack/interactive-messages';

const { SLACK_SIGNING_SECRET } = process.env;

const slackInteractions = createMessageAdapter(SLACK_SIGNING_SECRET);
const router = Express.Router();

router.use('/interactive-endpoint', slackInteractions.requestListener());
router.use('/action-endpoint', slackInteractions.requestListener());

export default router;
