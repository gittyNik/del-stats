import 'core-js/stable';
import 'regenerator-runtime/runtime';
import 'dotenv/config';
import { createWorker } from './controllers/queue.controller';
import { sendFirewallDailyStats } from './integrations/slack/team-app/controllers/firewall.controller';

const deltaHandler = job => {
  if (job.name === 'breakouts') {
    console.log('sending breakouts schedule for the day');
  }

  if (job.name === 'slack_firewall_stats') {
    console.log('processing slack_firewall_stats');
    sendFirewallDailyStats().then(() => {
      console.log('sending firewall stats from previous day');
    }).catch(err => {
      console.warn('Unable to send firewall stats');
    });
  }

  if (job.name === 'firewall_retry') {
    console.log('sending firewall retry message');
    sendSms(job.data.phone, TEMPLATE_FIREWALL_RETRY(job.data.name))
      .then(() => {
        console.log('sent retry sms to the user');
      });
  }
};

createWorker(deltaHandler);
