import { listEvents, createEvent } from './calendar.model';
import { getGoogleTokens } from '../../models/social_connection';
import { googleConfig } from '../../util/calendar-util';

const { google } = require('googleapis');

export const getAllCalendarEvents = async (req, res) => {
  const { userId } = req.jwtData;
  // get oauth2 client
  const oauth2Client = new google.auth.OAuth2(
    googleConfig.clientId,
    googleConfig.clientSecret,
    googleConfig.redirect,
  );
  const tokens = await getGoogleTokens(userId);
  if (tokens === null) {
    console.error(`unble to get tokens for userID: ${userId}`);
    res.sendStatus(500);
  }
  oauth2Client.setCredentials({
    refresh_token: tokens.refresh_token,
  });
  // get calendar events by passing oauth2 client
  if (oauth2Client) {
    listEvents(oauth2Client)
      .then(events => {
        // console.log(events);
        if (events) {
          const data = {
            name: req.jwtData.user.name,
            id: req.jwtData.user.id,
            email: req.jwtData.user.email,
            events: events || 'No upcoming events.',
          };
          res.json(data);
        } else {
          res.sendStatus(500);
        }
      })
      .catch(err => {
        console.error(err);
        res.send(500);
      });
  } else {
    const err_msg = `Failed to get Oauth2 credentail for ${userId}`;
    console.error(err_msg);
    res.sendStatus(500);
  }
};


export const createCalendarEvent = async (req, res) => {
  const { userId } = req.jwtData;
  const event_details = req.body.event;
  // console.log(req.jwtData);
  // get oauth2 client
  const oauth2Client = new google.auth.OAuth2(
    googleConfig.clientId,
    googleConfig.clientSecret,
    googleConfig.redirect,
  );
  const tokens = await getGoogleTokens(userId);
  // console.log(tokens);
  if (tokens === null) {
    console.error(`unble to get tokens for userID: ${userId}`);
    res.sendStatus(500);
  }
  oauth2Client.setCredentials({
    refresh_token: tokens.refresh_token,
  });

  createEvent(oauth2Client, event_details)
    .then(event_link => {
      const data = {
        name: req.jwtData.user.name,
        id: req.jwtData.user.id,
        email: req.jwtData.user.email,
        event_link,
      };
      res.send(data);
    })
    .catch(err => {
      console.error(err);
      res.sendStatus(500);
    });
};


// export const scheduleCalendarEventForLearner = (req, res) => {
//   // get oauth2 client
//   const oauth2Client = new google.auth.OAuth2();
//   const user_id = req.body.user_id;
//   oauth2Client.setCredentials({
//     access_token: req.session.user.accessToken
//   });

//   // create calendar events by passing oauth2 client
//   scheduleLearnerBreakoutEvents(oauth2Client, user_id, (events) => {

//     const data = {
//       name: req.session.user.name,
//       displayPicture: req.session.user.displayPicture,
//       id: req.session.user.id,
//       email: req.session.user.email,
//       events: events
//     }
//     res.send(data);
//   });
// };
