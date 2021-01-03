import cron from 'node-cron';
import { postTodaysBreakouts } from './integrations/slack/delta-app/controllers/web.controller';
import { postOverlappingBreakouts } from './integrations/slack/team-app/controllers/milestone.controller';
import { getTodaysCohortBreakouts, getNDaysCohortBreakouts } from './models/cohort_breakout';
import { logger } from './util/logger';
import 'dotenv/config';

// Every day at 10:AM - 0 10 * * *
cron.schedule('0 10 * * *', async () => {
  if (process.env.NODE_ENV === 'production') {
    const payload = await getTodaysCohortBreakouts();
    const res = await postTodaysBreakouts(payload);
    logger.info({
      text: 'Todays breakouts posted on SPE',
      data: res,
    });
  } else {
    console.log('TIME FOR DAILY SLACK REMINDERS');
  }
}, {
  scheduled: true,
  timezone: 'Asia/Kolkata',
});

// Send conflicting breakouts
cron.schedule('0 9 * * *', async () => {
  if (process.env.NODE_ENV === 'production') {
    const overlapStartDay = process.env.OVERLAP_START_DATE;
    let startDate = parseInt(overlapStartDay, 10);
    const payload = await getNDaysCohortBreakouts(startDate);
    const res = await postOverlappingBreakouts(startDate, payload);
    logger.info({
      text: 'Conflicting breakouts sent on SOALEDU',
      data: res,
    });
  } else {
    console.log('TIME FOR DAILY SLACK REMINDERS');
  }
}, {
  scheduled: true,
  timezone: 'Asia/Kolkata',
});

export default cron;
