import { WebClient } from '@slack/web-api';
import { IncomingWebhook } from '@slack/webhook';
import { getPendingApplications } from '../../../../models/application';
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
};

/*
*  Update view on App Home
*/
export const showUpcomingCohorts = (user_id) => {
  getPendingApplications()
    .then(applications => {
      // console.log(applications[0]);
      const view = createUpcomingCohortsView(applications);
      console.log(view.blocks[0]);
      console.log(view.blocks[1]);
      console.log(view.blocks[2]);
      console.log(view.blocks[3]);
      console.log(view.blocks[4]);
      console.log(view.blocks[5]);

      return web.views.publish({
        view,
        user_id,
      });
    })
    .catch(err => {
      console.log(err);
    });
};

export default SLACK_FIREWALL_WEBHOOK;
