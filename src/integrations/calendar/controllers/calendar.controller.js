import { listEvents, createEvent, updateEvent, deleteEvent } from '../calendar.model';
import { getGoogleTokens } from '../../../models/social_connection';
import { googleConfig, getGoogleOauthOfUser } from '../../../util/calendar-util';
import { createCalendarEventsForLearner } from '../../../models/learner_breakout';

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

        const data = {
          name: req.jwtData.user.name,
          id: req.jwtData.user.id,
          email: req.jwtData.user.email,
          events: events || 'No upcoming events.',
        };
        res.json(data);
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

export const updateCalendarEvent = async (req, res) => {
  const { userId } = req.jwtData;
  const event_details = req.body.event;
  const { eventId } = req.params;

  const oauth2Client = await getGoogleOauthOfUser(userId);
  updateEvent(oauth2Client, eventId, event_details)
    .then(event_data => {
      res.send(event_data);
    })
    .catch(err => {
      console.error(err);
      res.sendStatus(500);
    });
};


export const deleteOneEvent = async (req, res) => {
  const { userId } = req.jwtData;
  const { eventId } = req.params;

  const oauth2Client = await getGoogleOauthOfUser(userId);
  deleteEvent(oauth2Client, eventId)
    .then(event_data => {
      // console.log(event_data);
      res.send(event_data);
    })
    .catch(err => {
      console.error(err);
      res.send(500);
    });
};

export const createEventForLearner = async (req, res) => {
  const { learner_id } = req.body;
  const data = await createCalendarEventsForLearner(learner_id);
  console.log(data);
  res.json({
    text: 'Create Calendar events for a leaner and updating LearnerBreakout',
    data: 'success',
  });
};

export const createEventForEducator = async (req, res) => {
  const { cohort_breakout_id } = req.body;

  // get user_id
  const { userId } = req.jwtData;
  // get calendar events details
  // get oauth client
  const oauth2Client = await getGoogleOauthOfUser(userId);
  // create event for educator

  res.send({
    cohort_breakout_id,
    oauth2Client,
  });
};
