import 'core-js/stable';
import 'regenerator-runtime/runtime';
import { Worker } from 'bullmq';

const worker = new Worker('delta', job => {
  if (job.name === 'breakouts') {
    console.log('sending breakouts schedule for the day');
  }
});
