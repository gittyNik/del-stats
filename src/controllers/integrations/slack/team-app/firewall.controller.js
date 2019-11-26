import { WebClient } from '@slack/web-api';
import { IncomingWebhook } from '@slack/webhook';
import { createUpcomingCohortsView, buildFirewallResult } from './firewall.view';

const { SLACK_FIREWALL_WEBHOOK, SLACK_TEAM_BOT_TOKEN } = process.env;

// Initialize
const web = new WebClient(SLACK_TEAM_BOT_TOKEN);
const webhook = new IncomingWebhook(SLACK_FIREWALL_WEBHOOK);

/*
*  Send notification to slack on firewall application submission
*/
export const sendFirewallResult = (application, phone) => {
  const view = buildFirewallResult(phone, phone, application.test_series);
  webhook.send(view);
}

/*
*  Update view on App Home
*/
export const showUpcomingCohorts = (user_id) => {
  const view = createUpcomingCohortsView([]);

  web.views.publish({
    user_id,
    view,
  });

};

export default SLACK_FIREWALL_WEBHOOK;
