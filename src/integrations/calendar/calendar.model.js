
import { LearnerBreakout } from '../../models/learner_breakout';
import { CohortBreakout } from '../../models/cohort_breakout';

const { google } = require('googleapis');


export const listEvents = function (auth, cb) {
    const calendar = google.calendar({version: 'v3', auth});
    calendar.events.list({
      calendarId: 'primary',
      timeMin: (new Date()).toISOString(),
      maxResults: 10,
      singleEvents: true,
      orderBy: 'startTime',
    }, (err, res) => {
      if (err) return console.log('The API returned an error: ' + err);
      const events = res.data.items;
      if (events.length) {
        cb(events)
      } else {
        console.log('No upcoming events found.');
      }
    });
}

// var event = {
//     'summary': 'Sample Event',
//     'location': 'School of Accelerated learning',
//     'description': 'A sample event.',
//     'start': {
//       'dateTime': (new Date()).toISOString(),
//       'timeZone': 'Asia/Kolkata',
//     },
//     'end': {
//       'dateTime': (new Date()).toISOString(),
//       'timeZone': 'Asia/Kolkata',
//     },
//     'recurrence': [
//       'RRULE:FREQ=DAILY;COUNT=2'
//     ],
//     'attendees': [
//       {'email': 'vaulstein@soal.io'},
//       {'email': 'hello@soal.io'},
//     ],
//     'reminders': {
//       'useDefault': false,
//       'overrides': [
//         {'method': 'email', 'minutes': 24 * 60},
//         {'method': 'popup', 'minutes': 10},
//       ],
//     },
// };

export const eventCreator = (summary, start=null, end=null, duration=30, recurrence, attendees, 
    reminders, location='School of Accelerated learning', description='') => {
    if (start == null){
        start = (new Date()).toISOString()
    }
    if (end == null){
        var d = new Date(start.valueOf()); d.setMinutes(d.getMinutes() + duration);
        end = d.toISOString()
    }
    if (reminders == null){
        reminders = {
            'useDefault': false,
            'overrides': [
              {'method': 'email', 'minutes': 24 * 60},
              {'method': 'popup', 'minutes': 10},
            ],
          }
    }
    var event = {
        'summary': summary,
        'location': location,
        'description': description,
        'start': {
          'dateTime': start,
          'timeZone': 'Asia/Kolkata',
        },
        'end': {
          'dateTime': end,
          'timeZone': 'Asia/Kolkata',
        },
        'recurrence': recurrence,
        'attendees': attendees,
        'reminders': reminders,
    };
    return event
};

export const createEvents = function (auth, event_details, cb) {
    const calendar = google.calendar({version: 'v3', auth});
    const {summary, location, description, start, end, duration, recurrence, attendees, reminders} = event_details;
    const calendar_event = eventCreator(summary, start, end, duration, recurrence, attendees, reminders, location, description);
    calendar.events.insert({
        auth: auth,
        calendarId: 'primary',
        resource: calendar_event,
      }, function(err, event) {
        if (err) {
          console.log('There was an error contacting the Calendar service: ' + err);
          return;
        }
        cb(event.htmlLink);
      });
}

export const getCohortSchedule = (cohortBreakoutId) =>
  CohortBreakout.findOne({
    attributes: ['time_scheduled', 'duration', 'location'],
    where: {
      id: cohortBreakoutId
    },
    raw: true,
  })

export const getCohortBreakouts = (leanerBreakouts) => {
  return Promise.all(leanerBreakouts.map(async (learnerBreakout) => {
    try {
      let cohortBreakoutDetails = await getCohortSchedule(learnerBreakout.cohort_breakout_id);
      console.log('cohortBreakoutDetails: ', cohortBreakoutDetails);
      return cohortBreakoutDetails;
    } catch (err) {
      console.log('error in getting Cohort breakouts', err);
      return null;
    }
  }));
};

export const setGoogleCalendarReminder = (auth, eachcohortBreakout) => {
    const { time_scheduled, duration, location, summary, description} = eachcohortBreakout;
    let event_details = {summary, location, description, start: time_scheduled, duration};
    let created_link = createEvents(auth, event_details, (event_link) => {  
        return event_link;
    });
    return created_link;
}

export const createLearnerCalendarEvents = (auth, cohortBreakouts) => {
  return Promise.all(cohortBreakouts.map(async (eachcohortBreakout) => {
    try {
      let cohortBreakoutDetails = await setGoogleCalendarReminder(auth, eachcohortBreakout);
      console.log('extra:', cohortBreakoutDetails);
      return cohortBreakoutDetails;
    } catch (err) {
      console.log('error in creating calendar event', err);
      return null;
    }
  }));
}

export const scheduleLearnerBreakoutEvents = (auth, user_id) => 
  LearnerBreakout.findAll({
    attributes: ['cohort_breakout_id'],
    where: {
      id: user_id,
    },
    raw: true,
  })
  .then(leanerBreakouts => getCohortBreakouts(leanerBreakouts))
  .then(cohortBreakouts => createLearnerCalendarEvents(auth, cohortBreakouts))
  .catch(err => {
    console.error(err);
    return null;
});