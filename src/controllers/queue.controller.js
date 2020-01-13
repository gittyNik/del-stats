import { Queue, QueueScheduler, Worker } from 'bullmq';

const queue = new Queue('delta');
let scheduler = null;
const everyMorning = { cron: '0 7 * * *' };
const everySecond = { cron: '* * * ? * *' };

export const scheduleFirewallStats = () => queue.add('slack_firewall_stats', {}, {
  repeat: everyMorning,
});

export const initQueue = () => {
  queue.removeRepeatable('slack_firewall_stats', everyMorning);
  queue.removeRepeatable('slack_firewall_stats', everySecond);
  scheduleFirewallStats();
};

initQueue();

export const createWorker = handler => {
  const worker = new Worker('delta', handler);

  worker.on('completed', (job) => {
    console.log(`${job.id} has completed!`);
  });

  worker.on('failed', (job, err) => {
    console.log(`${job.id} has failed with ${err.message}`);
  });

  // initialize scheduler after a worker is created
  if (!scheduler) {
    scheduler = new QueueScheduler('delta');
  }

  return worker;
};
