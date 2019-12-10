import { Queue } from 'bullmq';

const myQueue = new Queue('delta');

export const sendBreakoutSchedule = () => {
  myQueue.add('breakouts', { topic: 'intro to node' });
};
