import { WebClient } from '@slack/web-api';
import { IncomingWebhook } from '@slack/webhook';
import { getPendingApplicationCohorts } from '../../../../models/application';
import { getLiveCohorts } from '../../../../models/cohort';
import { composeHome, buildFirewallResult } from './firewall.view';

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
  getLiveCohorts()
    .then(cohorts => getPendingApplicationCohorts()
      .then(applications => {
        const view = composeHome(applications, cohorts);
        // console.log(JSON.stringify(view));
        return web.views.publish({
          view,
          user_id,
        });
      }))
    .catch(err => {
      console.log(err);
    });
};


export default SLACK_FIREWALL_WEBHOOK;
