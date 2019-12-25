import { createEventAdapter } from '@slack/events-api';
import { publishHome } from '../controllers/home.controller';

const slackEvents = createEventAdapter(process.env.SLACK_DELTA_SECRET);
// Attach listeners to events by Slack Event "type". See: https://api.slack.com/events/message.im
slackEvents.on('message', (event) => {
  console.log(event);
  console.log(`Received a message event: user ${event.user} in channel ${event.channel} says ${event.text}`);
});

slackEvents.on('app_home_opened', (event) => {
  if (event.tab === 'home') {
    publishHome(event.user).catch(err => {
      console.log(err);
    });
  }
});

slackEvents.on('error', (error) => {
  console.log(error);
});

export default slackEvents.expressMiddleware();
