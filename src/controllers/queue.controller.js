import { Queue, QueueScheduler, Worker } from 'bullmq';
import cache from '../cache';
import logger from '../util/logger';

const queue = new Queue('delta', { cache });

let scheduler = null;
const everyMorning = { cron: '0 7 * * *' };
const everySecond = { cron: '* * * ? * *' };

export const scheduleFirewallStats = () => queue.add('slack_firewall_stats', {}, {
  repeat: everyMorning,
});

// schedule after a week
export const scheduleFirewallRetry = (phone, name) => queue.add('firewall_retry', { phone, name }, {
  delay: 7 * 24 * 3600 * 1000,
});

export const initQueue = () => {
  queue.removeRepeatable('slack_firewall_stats', everyMorning);
  queue.removeRepeatable('slack_firewall_stats', everySecond);
  scheduleFirewallStats();
};

initQueue();

export const createWorker = handler => {
  const worker = new Worker('delta', handler, { cache });

  worker.on('completed', (job) => {
    // logger.info(`${job.id} has completed!`);
  });

  worker.on('failed', (job, err) => {
    logger.error(`${job.id} has failed with ${err.message}`);
  });

  // initialize scheduler after a worker is created
  if (!scheduler) {
    scheduler = new QueueScheduler('delta', { cache });
  }

  return worker;
};
