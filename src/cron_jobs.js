import cron from 'node-cron';
import cache from './cache';
import {
  checkBalance,
} from './controllers/auth/otp.controller';
import { postTodaysBreakouts } from './integrations/slack/delta-app/controllers/web.controller';
import {
  postOverlappingBreakouts, sendMessageToSlackChannel,
} from './integrations/slack/team-app/controllers/milestone.controller';
import {
  getTodaysCohortBreakouts,
  getNDaysDuplicateCatalystBreakouts,
  getNDaysCohortBreakouts,
} from './models/cohort_breakout';
import {
  createReviewSchedule,
} from './models/reviews';
import {
  autoCreateAssessments,
} from './controllers/learning/assessment.controller';
import logger from './util/logger';
import 'dotenv/config';

// Every day at 10:AM - 0 10 * * *
cron.schedule('0 10 * * *', async () => {
  if (process.env.NODE_ENV === 'production') {
    const alreadyStarted = await cache.get('BREAKOUTS');
    if (alreadyStarted === null) {
      // overlapStartDay is only a number used to handle multiple messages on channel
      await cache.setex('BREAKOUTS', 3600, 'STARTED');
      const payload = await getTodaysCohortBreakouts();
      const res = await postTodaysBreakouts(payload);
      logger.info({
        text: 'Todays breakouts posted on SPE',
        data: res,
      });
    }
  } else {
    logger.info('TIME FOR DAILY SLACK REMINDERS');
  }
}, {
  scheduled: true,
  timezone: 'Asia/Kolkata',
});

// Every Thursday run cron at 8pm to schedule reviews
cron.schedule('0 9 * * 3', async () => {
  if (process.env.NODE_ENV === 'production') {
    const alreadyStarted = await cache.get('REVIEWS');
    if (alreadyStarted === null) {
      // overlapStartDay is only a number used to handle multiple messages on channel
      await cache.setex('REVIEWS', 3600, 'STARTED');
      await createReviewSchedule('tep', 16);
      logger.info('Reviews have been scheduled for Full-time');
      await createReviewSchedule('tep', 26);
      logger.info('Reviews have been scheduled for Part-time');
    }
  } else {
    logger.info('TIME FOR DAILY SLACK REMINDERS');
  }
}, {
  scheduled: true,
  timezone: 'Asia/Kolkata',
});

// Every Thursday run cron at 8pm to schedule reviews
cron.schedule('0 8 * * 3', async () => {
  if (process.env.NODE_ENV === 'production') {
    const alreadyStarted = await cache.get('ASSESSMENTS');
    if (alreadyStarted === null) {
      // overlapStartDay is only a number used to handle multiple messages on channel
      await cache.setex('ASSESSMENTS', 3600, 'STARTED');
      await autoCreateAssessments('tep', 16);
      logger.info('Reviews have been scheduled for Full-time');
      await autoCreateAssessments('tep', 26);
      logger.info('Reviews have been scheduled for Part-time');
    }
  } else {
    logger.info('TIME FOR DAILY SLACK REMINDERS');
  }
}, {
  scheduled: true,
  timezone: 'Asia/Kolkata',
});

// Send conflicting breakouts
cron.schedule('30 8 * * *', async () => {
  if (process.env.NODE_ENV === 'production') {
    const overlapStartDay = process.env.OVERLAP_START_DATE;
    let startDate = parseInt(overlapStartDay, 10);
    const alreadyStarted = await cache.get('CONFLICT');
    if (alreadyStarted === null) {
      // overlapStartDay is only a number used to handle multiple messages on channel
      await cache.setex('CONFLICT', 3600, overlapStartDay);
      const payload = await getNDaysDuplicateCatalystBreakouts(startDate);
      await postOverlappingBreakouts(startDate, payload, 'Catalyst');
      const cohortPayload = await getNDaysCohortBreakouts(startDate);
      await postOverlappingBreakouts(startDate, cohortPayload, 'Cohort');
      logger.info({
        text: 'Conflicting breakouts sent on SOALEDU',
        // data: res,
      });
      try {
        const OTPBalance = await checkBalance();
        let rechargeMessage;
        let context;
        if (OTPBalance < 50) {
          rechargeMessage = '*<@owners>* Please recharge MSG91. Balance exhausted!';
          context = 'OTP Balance exhausted';
          sendMessageToSlackChannel(rechargeMessage, context, process.env.SLACK_MSG91_CHANNEL);
        } else {
          rechargeMessage = `OTP Balance: ${OTPBalance}`;
          context = 'OTP Balance';
          sendMessageToSlackChannel(rechargeMessage, context, process.env.SLACK_MSG91_CHANNEL);
        }
      } catch (err1) {
        console.warn('Could not check OTP balance');
      }
    }
  } else {
    console.log('TIME FOR DAILY SLACK REMINDERS');
  }
}, {
  scheduled: true,
  timezone: 'Asia/Kolkata',
});

export default cron;
