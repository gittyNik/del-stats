import cron from 'node-cron';
import { postTodaysBreakouts } from './integrations/slack/delta-app/controllers/web.controller';
import { getTodaysCohortBreakouts } from './models/cohort_breakout';
import logger from './util/logger';

// Every day at 10:AM - 0 10 * * *
cron.schedule('0 10 * * *', async () => {
  const payload = await getTodaysCohortBreakouts();
  const res = await postTodaysBreakouts(payload);
  logger.info({
    text: 'Todays breakouts posted on SPE',
    data: res,
  });
}, {
  scheduled: true,
  timezone: 'Asia/Kolkata',
});

export default cron;