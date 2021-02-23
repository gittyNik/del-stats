import { createEventAdapter } from '@slack/events-api';
import { publishHome } from '../controllers/home.controller';
import logger from '../../../../util/logger';

const slackEvents = createEventAdapter(process.env.SLACK_DELTA_SECRET);
// Attach listeners to events by Slack Event "type". See: https://api.slack.com/events/message.im
slackEvents.on('message', (event) => {
  logger.info(event);
  logger.info(`Received a message event: user ${event.user} in channel ${event.channel} says ${event.text}`);
});

slackEvents.on('app_home_opened', (event) => {
  if (event.tab === 'home') {
    publishHome(event.user).catch(err => {
      logger.error(err);
    });
  }
});

slackEvents.on('error', (error) => {
  logger.error(error);
});

export default slackEvents.expressMiddleware();
