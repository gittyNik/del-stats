import { google } from 'googleapis';
import { convertToEventBody } from '../../util/calendar-util';


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
  if (end == null || end === '') {
    let d = new Date(start.valueOf());
    d.setMinutes(d.getMinutes() + duration);
    end = d.toISOString();
  }
  let event = convertToEventBody(summary, start, end, description, location);
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
