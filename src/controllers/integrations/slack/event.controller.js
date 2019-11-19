import { createEventAdapter } from '@slack/events-api';

const { SLACK_SIGNING_SECRET } = process.env;

const slackEvents = createEventAdapter(SLACK_SIGNING_SECRET);
// Attach listeners to events by Slack Event "type". See: https://api.slack.com/events/message.im
slackEvents.on('message', (event) => {
  console.log(`Received a message event: user ${event.user} in channel ${event.channel} says ${event.text}`);
});

export default slackInteractions;
