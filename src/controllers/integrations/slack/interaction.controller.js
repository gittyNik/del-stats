import { createMessageAdapter } from '@slack/interactive-messages';

const { SLACK_SIGNING_SECRET } = process.env;
const slackInteractions = createMessageAdapter(SLACK_SIGNING_SECRET);

slackInteractions.action({ type: 'reject_firewall_applicant' }, (payload, respond) => {
  // Logs the contents of the action to the console
  console.log('payload', payload);

  // Send an additional message to the whole channel
  respond({ text: 'Thanks for your review.' });

});

export default slackInteractions;
