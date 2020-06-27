const request = require('superagent');
const jwt = require('jsonwebtoken');

const jwt_payload = {
  iss: process.env.ZOOM_API_KEY,
  exp: ((new Date()).getTime() + 5000),
};
const token = jwt.sign(jwt_payload, process.env.ZOOM_API_SECRET);


const MEETING_SETTINGS = {
  host_video: true,
  participant_video: true,
  in_meeting: true,
  join_before_host: true,
  mute_upon_entry: true,
  watermark: false,
  use_pmi: false,
  approval_type: 2,
  audio: 'voip',
  auto_recording: 'local', // options: local, cloud and none
  enforce_login: false,

};


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
  const { ZOOM_BASE_URL, ZOOM_USER } = process.env;
  const { topic, type, start_time, duration, agenda } = req.body;
  const meeting_object = {
    topic,
    type: type || 2, // defaults to scheduled Meeting
    start_time,
    duration,
    timezone: 'Asia/Calcutta',
    password: 'soal',
    agenda,
    settings: MEETING_SETTINGS,
  };
  // console.log(meeting_object);
  request
    .post(`${ZOOM_BASE_URL}users/${ZOOM_USER}/meetings`) // todo: need to assign delta user to zoom user
    .send(meeting_object)
    .set('Authorization', `Bearer ${token}`)
    .set('User-Agent', 'Zoom-api-Jwt-Request')
    .set('content-type', 'application/json')
    .then(data => {
      // console.log(data);
      const {
        uuid, id, status,
        start_url, join_url, h323_password,
      } = data.body;
      // console.log(`ZOOM MEETING --> uuid: ${uuid}, id: ${id}, status: ${status}, join_url: ${join_url}, start_url: ${start_url} h323_password: ${h323_password}.`);
      res.json({
        text: `Successfully scheduled a meeting at ${start_time}`,
        data: {
          id,
          status,
          start_url,
          join_url,
        },
      });
    })
    .catch(err => {
      console.error(err);
      res.status(500).send({
        text: 'Error:',
        data: err.response.text,
      });
    });
};
