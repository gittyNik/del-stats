import Sequelize from 'sequelize';
import request from 'superagent';
import uuid from 'uuid/v4';
import jwt from 'jsonwebtoken';
import db from '../database';

const jwt_payload = {
  iss: process.env.ZOOM_API_KEY,
  exp: ((new Date()).getTime() + 5000),
};
export const zoom_token = jwt.sign(jwt_payload, process.env.ZOOM_API_SECRET);


export const VideoMeeting = db.define('video_meetings', {
  id: {
    primaryKey: true,
  },
  video_id: Sequelize.STRING,
  start_url: Sequelize.STRING,
  join_url: Sequelize.STRING,
  start_time: Sequelize.STRING, // zoom time format
  duration: Sequelize.STRING,
  created_at: {
    allowNull: false,
    type: Sequelize.DATE,
    defaultValue: Sequelize.literal('NOW()'),
  },
  updated_at: {
    allowNull: false,
    type: Sequelize.DATE,
    defaultValue: Sequelize.literal('NOW()'),
  },
});

const MEETING_SETTINGS = {
  host_video: 'true',
  participant_video: 'true',
  cn_meeting: 'false',
  in_meeting: 'true',
  join_before_host: 'true',
  mute_upon_entry: 'true',
  watermark: 'false',
  use_pmi: 'false',
  approval_type: 1,
  audio: 'voip',
  auto_recording: 'none', // options: local, cloud and none
  enforce_login: 'false',
  waiting_room: 'true',
};

export const createScheduledMeeting = (topic, agenda, start_time, duration, type) => {
  const { ZOOM_BASE_URL, ZOOM_USER } = process.env;
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

  request
    .post(`${ZOOM_BASE_URL}users/${ZOOM_USER}/meetings`) // todo: need to assign delta user to zoom user
    .send(meeting_object)
    .set('Authorization', `Bearer ${zoom_token}`)
    .set('User-Agent', 'Zoom-api-Jwt-Request')
    .set('content-type', 'application/json')
    .then(data => {
      // console.log(data);
      const {
        uuid, id, status,
        start_url, join_url, h323_password,
      } = data.body;
      console.log(`ZOOM MEETING --> uuid: ${uuid}, id: ${id}, status: ${status}, join_url: ${join_url}, start_url: ${start_url} h323_password: ${h323_password}.`);
      return {
        id,
        status,
        start_url,
        join_url,
      };
    })
    .catch(err => {
      console.log(err);
      return {
        text: 'Failed to create meeting',
      };
    });
};
