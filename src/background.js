import 'core-js/stable';
import 'regenerator-runtime/runtime';
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
    });
  }
};

createWorker(deltaHandler);
