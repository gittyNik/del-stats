import { WebClient } from '@slack/web-api';
import { IncomingWebhook } from '@slack/webhook';
import { getPendingApplicationCohorts, getStatsForDay } from '../../../../models/application';
import { getLiveCohorts } from '../../../../models/cohort';
import { composeHome, buildFirewallResult } from '../views/firewall.view';

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

export const sendFirewallDailyStats = () => getStatsForDay()
  .then(stats => {
    const msg = {
      text: `Firewall statistics: ${JSON.stringify(stats)}`,
      channel: process.env.SLACK_LEARNER_INTERVIEWS_CHANNEL,
    };
    console.log(msg);
    return web.chat.postMessage(msg);
  });

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
