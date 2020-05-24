
import { LearnerBreakout } from '../../models/learner_breakout';
import { CohortBreakout } from '../../models/cohort_breakout';
import { rfc3339 } from '../../util/calendar-util';

const { google } = require('googleapis');

export const listEvents = (auth) => {
  const calendar = google.calendar({ version: 'v3', auth });
  return calendar.events.list({
    calendarId: 'primary',
    timeMin: (new Date()).toISOString(),
    maxResults: 10,
    singleEvents: true,
    orderBy: 'startTime',
  })
    .then(res => {
      const events = res.data.items;
      return (events.length > 0) ? events : false;
    })
    .catch(err => {
      console.error(err);
      return false;
    });
};


export const createEvent = async (auth, event_details) => {
  const calendar = google.calendar({ version: 'v3', auth });
  let {
    summary, location, start, end, description,
    duration,
  } = event_details;
  const timeZone = 'Asia/Kolkata';
  if (end == null || end === '') {
    let d = new Date(start.valueOf());
    d.setMinutes(d.getMinutes() + duration);
    end = d.toISOString();
  }

  // eslint-disable-next-line no-shadow
  let event_body = (summary, start_time, end_time, description, location) => {
    let event_data = {
      summary,
      start: {
        dateTime: rfc3339(new Date(start_time)),
        timeZone,
      },
      end: {
        dateTime: rfc3339(new Date(end_time)),
        timeZone,
      },
      location: location || 'School of Accelerated learning',
      description,
      reminders: {
        useDefault: false,
        overrides: [
          { method: 'email', minutes: 24 * 60 },
          { method: 'popup', minutes: 10 },
        ],
      },
    };
    return event_data;
  };
  let event = event_body(summary, start, end, description, location);
  // console.log(event);

  return calendar.events
    .insert({
      auth,
      calendarId: 'primary',
      resource: event,
    })
    .then(_event => {
      // console.log(_event.data);
      return _event.data;
    })
    .then(_event => ({
      id: _event.id,
      htmlLink: _event.htmlLink,
    }))
    .catch(err => {
      console.error(err);
      return false;
    });
};

// export const getCohortSchedule = (cohortBreakoutId) =>
//   CohortBreakout.findOne({
//     attributes: ['time_scheduled', 'duration', 'location'],
//     where: {
//       id: cohortBreakoutId
//     },
//     raw: true,
//   });

// export const getCohortBreakouts = (leanerBreakouts) => {
//   return Promise.all(leanerBreakouts.map(async (learnerBreakout) => {
//     try {
//       let cohortBreakoutDetails = await getCohortSchedule(learnerBreakout.cohort_breakout_id);
//       console.log('cohortBreakoutDetails: ', cohortBreakoutDetails);
//       return cohortBreakoutDetails;
//     } catch (err) {
//       console.log('error in getting Cohort breakouts', err);
//       return null;
//     }
//   }));
// };

// export const setGoogleCalendarReminder = (auth, eachcohortBreakout) => {
//   const { time_scheduled, duration, location, summary, description } = eachcohortBreakout;
//   let event_details = { summary, location, description, start: time_scheduled, duration };
//   let created_link = createEvents(auth, event_details, (event_link) => {
//     return event_link;
//   });
//   return created_link;
// };

// export const createLearnerCalendarEvents = (auth, cohortBreakouts) => {
//   return Promise.all(cohortBreakouts.map(async (eachcohortBreakout) => {
//     try {
//       let cohortBreakoutDetails = await setGoogleCalendarReminder(auth, eachcohortBreakout);
//       console.log('extra:', cohortBreakoutDetails);
//       return cohortBreakoutDetails;
//     } catch (err) {
//       console.log('error in creating calendar event', err);
//       return null;
//     }
//   }));
// };

// export const scheduleLearnerBreakoutEvents = (auth, user_id) => LearnerBreakout
//   .findAll({
//     attributes: ['cohort_breakout_id'],
//     where: {
//       id: user_id,
//     },
//     raw: true,
//   })
//   .then(leanerBreakouts => getCohortBreakouts(leanerBreakouts))
//   .then(cohortBreakouts => createLearnerCalendarEvents(auth, cohortBreakouts))
//   .catch(err => {
//     console.error(err);
//     return null;
//   });
