import { Queue, QueueScheduler } from 'bullmq';

let queue;

const everyMorning = { cron: '0 7 * * *' };
const everySecond = { cron: '* * * ? * *' };

export const sendBreakoutSchedule = () => queue.add('breakouts', {
  topic: 'intro to node',
}, {
  repeat: everySecond,
});

const slackFirewallStats = () => queue.add('slack_firewall_stats', {}, {
  repeat: everyMorning,
});

export const initQueue = (queueName) => {
  queue = new Queue(queueName);
  new QueueScheduler(queueName);
  sendBreakoutSchedule();
  slackFirewallStats();
};
