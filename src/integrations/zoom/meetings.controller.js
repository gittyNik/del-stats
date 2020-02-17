const request = require('superagent');
const jwt = require('jsonwebtoken');

const jwt_payload = {
  iss: process.env.ZOOM_API_KEY,
  exp: ((new Date()).getTime() + 5000)
};
const token = jwt.sign(jwt_payload, process.env.ZOOM_API_SECRET);

// creating meeting for a user.
export const createMeeting = (req, res) => {
  const { ZOOM_BASE_URL } = process.env;

  const meeting_object = {
    topic: 'Milestone Breakout',
    type: 3,
    timezone: 'Asia/Calcutta',
    password: 'soal',
    agenda: 'Milestone Breakout',
    settings: {
      host_video: 'false',
      participant_video: 'true',
      cn_meeting: 'false',
      in_meeting: 'true',
      join_before_host: 'true',
      mute_upon_entry: 'false',
      watermark: 'false',
      use_pmi: 'false',
      approval_type: 0,
      audio: 'voip',
      auto_recording: 'false',
      enforce_login: 'false',
      registrants_email_notification: 'false',
    },
  };
  request
    .post(`${ZOOM_BASE_URL}users/ro-ppuJKTM6bE1xwVHN4hw/meetings`)
    .send(meeting_object)
    .set('Authorization', `Bearer ${token}`)
    .set('User-Agent', 'Zoom-api-Jwt-Request')
    .set('content-type', 'application/json')
    .then(data => {
      console.log(data);
      res.json({
        text: 'Response data from creating meeting, contains start_url and join_url',
        data: data.body, // todo: send only necessary resources.
      });
    })
    .catch(err => {
      console.log(err);
      res.status(500).send({
        text: 'Error:',
        data: err.response.text,
      });
    });
};

// getting user info
export const userInfo = (req, res) => {
  const { ZOOM_BASE_URL } = process.env;
  // const email = req.body.email
  request
    .get(`${ZOOM_BASE_URL}users`)
    .set('Authorization', `Bearer ${token}`)
    .set('User-Agent', 'Zoom-api-Jwt-Request')
    .set('content-type', 'application/json')
    .query({
      status: 'active',
      page_size: '30',
      page_number: '1',
      // role_id: '',
    })
    .then(data => {
      console.log(data);
      console.log(data.body);
      res.json({
        text: 'List/Array of all users in the zoom account',
        data: data.body.users,
      });
    })
    .catch(err => {
      console.log(err);
      res.sendStatus(500);
    });
};
