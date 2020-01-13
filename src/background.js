import 'core-js/stable';
import 'regenerator-runtime/runtime';
import { Worker } from 'bullmq';
import { initQueue } from './controllers/queue.controller';

const queueName = 'delta';

const deltaHandler = job => {
  if (job.name === 'breakouts') {
    console.log('sending breakouts schedule for the day');
  }

  if (job.name === 'slack_firewall_stats') {
    console.log('sending firewall stats from previous day');
  }
};

const worker = new Worker(queueName, deltaHandler);

worker.on('drained', (job) => {
  // Queue is drained, no more jobs left
  // console.log('All jobs drained :)');
});

worker.on('completed', (job) => {
  console.log(`${job.id} has completed!`);
});

worker.on('failed', (job, err) => {
  console.log(`${job.id} has failed with ${err.message}`);
});

initQueue(queueName);
