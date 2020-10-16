import cron from 'node-cron';
import { getTodaysCohortBreakouts } from './models/cohort_breakout';

// Every day at 10:AM
cron.schedule('0 10 * * *', async () => {
  await getTodaysCohortBreakouts();
}, {
  scheduled: true,
  timezone: 'Asia/Kolkata',
});

export default cron;
