import { listEvents, createEvents } from './calendar.model';
import { getGoogleTokens } from '../../models/social_connection';
import { googleConfig } from '../../util/calendar-util';

const { google } = require('googleapis');

export const getAllCalendarEvents = async (req, res) => {
  const { userId } = req.jwtData;
  console.log(req.jwtData);
  // get oauth2 client
  const oauth2Client = new google.auth.OAuth2(
    googleConfig.clientId,
    googleConfig.clientSecret,
    googleConfig.redirect,
  );
  const tokens = await getGoogleTokens(userId);
  console.log(tokens);
  if (tokens === null) {
    res.sendStatus(500);
  }
  oauth2Client.setCredentials({
    refresh_token: tokens.refresh_token,
  });
  // get calendar events by passing oauth2 client
  if (oauth2Client) {
    listEvents(oauth2Client, (events) => {
      console.log('events: ', events);

      const data = {
        name: req.jwtData.user.name,
        // displayPicture: req.session.user.displayPicture,
        id: req.jwtData.user.id,
        email: req.jwtData.user.email,
        events,
      };
      console.log(data);
      res.json(data);
    });
  } else {
    res.sendStatus(500);
  }
};


export const createCalendarEvent = (req, res) => {
  // get oauth2 client
  const oauth2Client = new google.auth.OAuth2();
  const event_details = req.body.event;
  oauth2Client.setCredentials({
    access_token: req.session.user.accessToken
  });

  // create calendar events by passing oauth2 client
  createEvents(oauth2Client, event_details, (event_link) => {

    const data = {
      name: req.session.user.name,
      displayPicture: req.session.user.displayPicture,
      id: req.session.user.id,
      email: req.session.user.email,
      event_link: event_link
    }
    res.send(data);
  });
};


export const scheduleCalendarEventForLearner = (req, res) => {
  // get oauth2 client
  const oauth2Client = new google.auth.OAuth2();
  const user_id = req.body.user_id;
  oauth2Client.setCredentials({
    access_token: req.session.user.accessToken
  });

  // create calendar events by passing oauth2 client
  scheduleLearnerBreakoutEvents(oauth2Client, user_id, (events) => {

    const data = {
      name: req.session.user.name,
      displayPicture: req.session.user.displayPicture,
      id: req.session.user.id,
      email: req.session.user.email,
      events: events
    }
    res.send(data);
  });
};

