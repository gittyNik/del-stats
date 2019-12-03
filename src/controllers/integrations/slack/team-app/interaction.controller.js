import { createMessageAdapter } from '@slack/interactive-messages';
import { beginCohortWithId } from '../../../../models/cohort';
import { showMilestoneDetails } from './milestone.controller';

const slackInteractions = createMessageAdapter(process.env.SLACK_TEAM_SECRET);

const firewallResponse = ({ payload, message }) => {
  const { user: { name }, message: { blocks } } = payload;

  blocks[3] = {
    type: 'section',
    text: {
      type: 'mrkdwn',
      text: message,
    },
  };

  blocks.splice(4, 1);

  return {
    blocks,
    replace_original: true,
    text: `Application is reviewed by ${name}`,
  };
};

slackInteractions.action({ actionId: /^open_cohort_details\..*/ }, (payload, respond) => {
  const { trigger_id } = payload;
  const cohort_id = payload.actions[0].value;
  // console.log(cohort_id);
  showMilestoneDetails(cohort_id, trigger_id);

  respond({ text: 'Success' });
});

slackInteractions.action({ type: 'button' }, (payload, respond) => {
  const { user: { username } } = payload; // username, blocks

  switch (payload.actions[0].value) {
    case 'reject_firewall_applicant':
      respond(firewallResponse({
        payload,
        message: `*Rejected!* \nThe candidate does not meet the standards. Review by @${username}`,
      }));
      break;
    case 'review_firewall_applicant':
      respond(firewallResponse({
        payload,
        message: `*One more step!*\nAdditional screening needed. Review by @${username}`,
      }));
      break;
    case 'offer_firewall_applicant':
      respond(firewallResponse({
        payload,
        message: `*Great job!*\nThe candidate is a good fit. Review by @${username}`,
      }));
      break;
    default:
      respond({
        text: 'Slack did not detect your action',
        replace_original: false,
      });
  }
});

slackInteractions.action({ action_id: 'cohort_settings' }, (payload) => {
  const cohort_id = payload.actions[0].selected_option.value;
  beginCohortWithId(cohort_id)
    .then(cohort => {
      console.log(`${cohort.name} cohort will be started`);
    }).catch(err => console.log(err));
});

export default slackInteractions.expressMiddleware();
