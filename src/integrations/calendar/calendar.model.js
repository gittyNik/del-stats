import { google } from 'googleapis';
import { convertToEventBody } from '../../util/calendar-util';
import logger from '../../util/logger';


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
      logger.error(err);
      return false;
    });
};


export const createEvent = (auth, event_details) => {
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
    .then(_event => ({
      id: _event.data.id,
      htmlLink: _event.data.htmlLink,
    }))
    .catch(err => {
      console.error(err);
      // return new Error('Failed to create a calendar event');
      return null;
    });
};

export const updateEvent = async (auth, eventId, event_details) => {
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

  return calendar.events
    .update({
      auth,
      eventId,
      calendarId: 'primary',
      resource: event,
    })
    .then(_event => _event.data)
    .then(_event => ({ id: _event.id, htmlLink: _event.htmlLink }))
    .catch(err => {
      console.error(err);
      return false;
    });
};

export const deleteEvent = async (auth, eventId) => {
  const calendar = google.calendar({ version: 'v3', auth });

  return calendar.events
    .delete({
      auth,
      eventId,
      calendarId: 'primary',
    })
    .then(_event => _event.data)
    .catch(err => {
      console.error(err);
      return new Error('Unable to delete the event');
    });
};
