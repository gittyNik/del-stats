import { createMessageAdapter } from '@slack/interactive-messages';
import { authSlack } from '../../../../models/social_connection';
import { showMilestoneDetails, requestTopicBreakout } from '../controllers/milestone.controller';
import { saveLink } from '../controllers/resource.controller';

// Authenticate higher order function
const authenticate = next => (payload, respond) => {
  console.log(payload);
  const { user, team } = payload;
  authSlack(user.id, team.id)
    .then(authData => {
      console.log(authData.user_id);
      next(payload, respond, authData);
    })
    .catch(err => {
      console.log(err);
      respond({
        text: 'You are not authorized. Try `/delta register` command',
      })
        .catch(e => console.error(e));
    });
};

const slackInteractions = createMessageAdapter(process.env.SLACK_DELTA_SECRET);

slackInteractions.action({
  actionId: /^open_cohort_details\..*/,
}, showMilestoneDetails);

slackInteractions.action({
  actionId: /^request_topic_breakout\..*/,
}, requestTopicBreakout);

slackInteractions.action({
  type: 'message_action',
  callback_id: 'save_link',
}, authenticate(saveLink));

export default slackInteractions.expressMiddleware();
