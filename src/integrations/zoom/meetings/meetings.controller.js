import { createScheduledMeeting } from '../../../models/video_meeting';
import { updateZoomMeetingForBreakout } from '../../../models/cohort_breakout';

const request = require('superagent');
const jwt = require('jsonwebtoken');

const jwt_payload = {
  iss: process.env.ZOOM_API_KEY,
  exp: ((new Date()).getTime() + 5000),
};
const token = jwt.sign(jwt_payload, process.env.ZOOM_API_SECRET);

export const listMeetings = (req, res) => {
  const { zoom_user_id } = req.params;
  const { ZOOM_BASE_URL } = process.env;
  const { page_size, page_number, type } = req.query;

  request
    .get(`${ZOOM_BASE_URL}users/${zoom_user_id}/meetings`)
    .set('Authorization', `Bearer ${token}`)
    .set('User-Agent', 'Zoom-api-Jwt-Request')
    .set('content-type', 'application/json')
    .query({
      page_size,
      page_number,
      type,
    })
    .then(data => {
      res.json({
        text: 'List of all meeting that are scheduled for a user',
        data: data.body,
      });
    })
    .catch(err => {
      console.error(err);
      res.sendStatus(500);
    });
};

export const meetingDetails = (req, res) => {
  const { meetingId } = req.params;
  const { ZOOM_BASE_URL } = process.env;

  request
    .get(`${ZOOM_BASE_URL}meetings/${meetingId}`)
    .set('Authorization', `Bearer ${token}`)
    .set('User-Agent', 'Zoom-api-Jwt-Request')
    .set('content-type', 'application/json')
    .then(data => {
      res.json({
        text: 'Details of a meeting',
        data: data.body,
      });
    })
    .catch(err => {
      console.error(err);
      res.sendStatus(500);
    });
};

/* types: {
*    1: Instant Meeting,
*    2: Scheduled Meeting,
*    3: Recurring Meeting with no fixed time,
*    4: Recurring meeting with scheduled time
*  }
*/
export const scheduleNewMeeting = (req, res) => {
  const {
    topic, type, start_time, duration, agenda, catalyst_id,
    time_zone,
  } = req.body;
  createScheduledMeeting(topic, start_time, duration, agenda,
    type, catalyst_id, time_zone).then(
    data => res.json({
      text: 'New Meeting',
      data,
    }),
  ).catch(err => res.json(err));
};

export const attachZoomToBreakout = (req, res) => {
  const {
    cohort_breakout_id,
  } = req.body;
  updateZoomMeetingForBreakout(cohort_breakout_id).then(
    data => res.json({
      text: 'Updated Meeting',
      data,
    }),
  ).catch(err => res.json(err));
};
