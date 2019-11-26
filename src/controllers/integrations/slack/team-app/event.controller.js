import { createEventAdapter } from '@slack/events-api';
import { showUpcomingCohorts } from './firewall.controller';

const slackEvents = createEventAdapter(process.env.SLACK_TEAM_SECRET);
// Attach listeners to events by Slack Event "type". See: https://api.slack.com/events/message.im
slackEvents.on('message', (event) => {
  console.log(`Received a message event: user ${event.user} in channel ${event.channel} says ${event.text}`);
});

slackEvents.on('app_home_opened', (event) => {
  if (event.tab === 'home') { showUpcomingCohorts(event.user); }
});

slackEvents.on('error', (error) => {
  console.log(error);
});

export default slackEvents.expressMiddleware();
