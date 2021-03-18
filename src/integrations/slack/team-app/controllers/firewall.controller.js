import { WebClient } from '@slack/web-api';
import { IncomingWebhook } from '@slack/webhook';
import { getPendingApplicationCohorts, getStatsForDay } from '../../../../models/application';
import { getLiveCohorts } from '../../../../models/cohort';
import { composeHome, buildFirewallResult } from '../views/firewall.view';
import logger from '../../../../util/logger';

const { SLACK_FIREWALL_WEBHOOK, SLACK_TEAM_BOT_TOKEN } = process.env;

// Initialize
const web = new WebClient(SLACK_TEAM_BOT_TOKEN);
const webhook = new IncomingWebhook(SLACK_FIREWALL_WEBHOOK);

/*
*  Send notification to slack on firewall application submission
*/
export const sendFirewallResult = (application, phone) => {
  const view = buildFirewallResult(phone, phone, application.test_series);
  try {
    webhook.send(view);
  } catch (err) {
    console.warn(`Failed to send message to slack: ${err}`);
  }
};

export const sendFirewallDailyStats = () => getStatsForDay()
  .then(stats => {
    const msg = {
      text: `Firewall statistics: ${JSON.stringify(stats)}`,
      channel: process.env.SLACK_LEARNER_INTERVIEWS_CHANNEL,
    };
    try {
      return web.chat.postMessage(msg);
    } catch (err) {
      logger.warn('Failed to send message to slack');
      return true;
    }
  });

/*
*  Update view on App Home
*/
export const showUpcomingCohorts = (user_id) => {
  getLiveCohorts()
    .then(cohorts => getPendingApplicationCohorts()
      .then(applications => {
        const view = composeHome(applications, cohorts);
        // logger.info(JSON.stringify(view));
        return web.views.publish({
          view,
          user_id,
        });
      }))
    .catch(err => {
      logger.error(err);
    });
};

export default SLACK_FIREWALL_WEBHOOK;
