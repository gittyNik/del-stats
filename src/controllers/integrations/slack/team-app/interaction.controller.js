import { createMessageAdapter } from '@slack/interactive-messages';

const slackInteractions = createMessageAdapter(process.env.SLACK_TEAM_SECRET);

slackInteractions.action({ type: 'button' }, (payload, respond) => {

  const { user } = payload; // username, name

  switch(payload.actions[0].value) {
    case 'reject_firewall_applicant':
      respond({ text: `Rejected! The candidate does not meet the standards set by the team. Reviewed by @${user.username}`, replace_original: false, response_type: 'ephermal'});
      break;
    case 'review_firewall_applicant':
      respond({ text: `Alert! @${user.username} has requested the team to interview the candidate for additional screening`, replace_original: false, response_type: 'in_channel'});
      break;
    case 'offer_firewall_applicant':
      respond({ text: `Great job! The candidate may be offered to join as a learner. Reviewed by @${user.username}`, replace_original: false, response_type: 'in_channel'});
      break;
    default:
      respond({ text: 'Thanks for your review.', replace_original: false});
  }

});

export default slackInteractions.requestListener();
