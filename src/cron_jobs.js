import cron from 'node-cron';
import Redis from 'ioredis';
import { postTodaysBreakouts } from './integrations/slack/delta-app/controllers/web.controller';
import { postOverlappingBreakouts } from './integrations/slack/team-app/controllers/milestone.controller';
import {
  getTodaysCohortBreakouts,
  getNDaysDuplicateCatalystBreakouts,
  getNDaysCohortBreakouts,
} from './models/cohort_breakout';
import { logger } from './util/logger';
import 'dotenv/config';

const redis = new Redis(process.env.REDIS_URL);

// Every day at 10:AM - 0 10 * * *
cron.schedule('0 10 * * *', async () => {
  if (process.env.NODE_ENV === 'production') {
    const alreadyStarted = await redis.get('BREAKOUTS');
    if (alreadyStarted === null) {
      // overlapStartDay is only a number used to handle multiple messages on channel
      redis.setex('BREAKOUTS', 3600, 'STARTED');
      const payload = await getTodaysCohortBreakouts();
      const res = await postTodaysBreakouts(payload);
      logger.info({
        text: 'Todays breakouts posted on SPE',
        data: res,
      });
    }
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
    const alreadyStarted = await redis.get('CONFLICT');
    if (alreadyStarted === null) {
      // overlapStartDay is only a number used to handle multiple messages on channel
      redis.setex('CONFLICT', 3600, overlapStartDay);
      const payload = await getNDaysDuplicateCatalystBreakouts(startDate);
      await postOverlappingBreakouts(startDate, payload, 'Catalyst');
      const cohortPayload = await getNDaysCohortBreakouts(startDate);
      await postOverlappingBreakouts(startDate, cohortPayload, 'Cohort');
      logger.info({
        text: 'Conflicting breakouts sent on SOALEDU',
        // data: res,
      });
    }
  } else {
    console.log('TIME FOR DAILY SLACK REMINDERS');
  }
}, {
  scheduled: true,
  timezone: 'Asia/Kolkata',
});

export default cron;
