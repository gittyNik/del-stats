import { createMessageAdapter } from '@slack/interactive-messages';
import { showMilestoneDetails, requestTopicBreakout } from './controllers/milestone.controller';
import { createFromSlackAttachment } from '../../../models/resource';

const slackInteractions = createMessageAdapter(process.env.SLACK_DELTA_SECRET);

slackInteractions.action({ actionId: /^open_cohort_details\..*/ }, (payload) => {
  const { trigger_id } = payload;
  const cohort_id = payload.actions[0].value;

  showMilestoneDetails(cohort_id, trigger_id);
});

slackInteractions.action({ actionId: /^request_topic_breakout\..*/ }, (payload) => {
  const [topic_id, cohort_id] = payload.actions[0].value.split('.');

  requestTopicBreakout(topic_id, cohort_id, payload.user.username);
});


slackInteractions.action({ type: 'message_action', callback_id: 'save_link' }, (payload, respond) => {
  // Logs the contents of the action to the console
  const { attachments } = payload.message;
  if (attachments && attachments[0]) {
    createFromSlackAttachment(attachments[0])
      .then(resource => {
        console.log(resource);
        respond('success');
      });
  }
});

// This needs to be at the bottom
slackInteractions.action({ type: 'button' }, (payload, respond) => {
  // Logs the contents of the action to the console
  console.log('payload', payload);

  // Send an additional message to the whole channel
  respond({ text: 'Thanks for your review.' });
});

export default slackInteractions.expressMiddleware();
