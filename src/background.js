import 'core-js/stable';
import 'regenerator-runtime/runtime';
import 'dotenv/config';
import { createWorker } from './controllers/queue.controller';
import { sendFirewallDailyStats } from './integrations/slack/team-app/controllers/firewall.controller';
import logger from './util/logger';

const deltaHandler = job => {
  if (job.name === 'breakouts') {
    logger.info('sending breakouts schedule for the day');
  }

  if (job.name === 'slack_firewall_stats') {
    logger.info('processing slack_firewall_stats');
    sendFirewallDailyStats().then(() => {
      logger.info('sending firewall stats from previous day');
    });
  }

  if (job.name === 'firewall_retry') {
    logger.info('sending firewall retry message');
    sendSms(job.data.phone, TEMPLATE_FIREWALL_RETRY(job.data.name))
      .then(() => {
        logger.info('sent retry sms to the user');
      });
  }
};

createWorker(deltaHandler);
