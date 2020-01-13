import { Queue } from 'bullmq';

const myQueue = new Queue('delta');
const everyMorning = { cron: '0 7 * * *' };
const everySecond = { cron: '* * * ? * *' };

export const sendBreakoutSchedule = () => {
  myQueue.add('breakouts', { topic: 'intro to node' });
};

const slackFirewallStats = () => myQueue.add('slack_firewall_stats', {}, {
  repeat: everySecond,
});

export const initQueue = () => slackFirewallStats();
