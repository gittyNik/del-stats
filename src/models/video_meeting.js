import Sequelize from 'sequelize';
import request from 'superagent';
import uuid from 'uuid/v4';
import jwt from 'jsonwebtoken';
import db from '../database';
import { LearnerBreakout } from './learner_breakout';
import { SocialConnection } from './social_connection';
import { CohortBreakout } from './cohort_breakout';

export const VideoMeeting = db.define('video_meetings', {
  id: {
    type: Sequelize.UUID,
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


const jwt_payload = {
  iss: process.env.ZOOM_API_KEY,
  exp: ((new Date()).getTime() + 5000),
};
export const zoom_token = jwt.sign(jwt_payload, process.env.ZOOM_API_SECRET);

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

export const deleteMeetingFromZoom = (video_id) => {
  const { ZOOM_BASE_URL } = process.env;
  request
    .delete(`${ZOOM_BASE_URL}meetings/${video_id}`)
    .set('Authorization', `Bearer ${zoom_token}`)
    .set('User-Agent', 'Zoom-api-Jwt-Request')
    .then(data => {
      console.log(data);
      if (data.status === 204) {
        console.log('Meeting successfully deleted');
        return true;
      }
      console.error(`failed to delete Meeting ${video_id}`);
      return false;
    })
    .catch(err => {
      console.log(err);
      return false;
    });
};

/*
Meeting type:
  1- Instant meeting
  2- Scheduled Meeting
  3- Recurring Meeting with no fixed time
  4- Recurring Meeting with a fixed time
*/
export const createScheduledMeeting = (topic, start_time, duration, agenda, type) => {
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

  return (request
    .post(`${ZOOM_BASE_URL}users/${ZOOM_USER}/meetings`) // todo: need to assign delta user to zoom user
    .send(meeting_object)
    .set('Authorization', `Bearer ${zoom_token}`)
    .set('User-Agent', 'Zoom-api-Jwt-Request')
    .set('content-type', 'application/json')
    .then(data => {
      // console.log(data);
      const {
        id, status,
        start_url, join_url, h323_password,
      } = data.body;
      console.log(`ZOOM MEETING --> id: ${id}, status: ${status}, join_url: ${join_url}`);
      return VideoMeeting.create({
        id: uuid(),
        video_id: id,
        start_url,
        join_url,
        duration,
      })
        .then(video => {
          console.log('meeting updated in db.');
          return {
            id,
            status,
            start_url,
            join_url,
          };
        })
        .catch(err => {
          // todo: delete the meeting from Zoom.
          deleteMeetingFromZoom(id);
          console.error('meeting created on zoom but error in storing to DB', err);
          return {
            text: 'Failed to save the vide details on DB.',
          };
        });
    })
    .catch(err => {
      console.log(err);
      return {
        text: 'Failed to create meeting',
      };
    })
  );
};

export const markIndividualAttendance = (participants, catalyst_id,
  cohort_breakout_id, attentiveness_threshold) => {
  let attendanceCount = 0;
  participants.forEach(participant => {
    const { user_email, duration, attentiveness_score } = participant;
    SocialConnection.findOne({
      attributes: ['user_id'],
      where: {
        email: user_email,
      },
    }).then(data => {
      let attendance;
      if ((attentiveness_score >= attentiveness_threshold) || (data.user_id !== catalyst_id)) {
        attendanceCount += 1;
        attendance = true;
      } else {
        attendance = false;
      }
      LearnerBreakout.update({
        attendance,
      }, {
        where: {
          cohort_breakout_id,
          learner_id: data.user_id,
        },
      });
    });
  });
  return attendanceCount;
};

/*
From Zoom API endpoint get users in breakout and mark attendance for them
https://marketplace.zoom.us/docs/api-reference/zoom-api/reports/reportmeetingparticipants
Zoom returns the users that attended a meeting, using this to mark attendance
*/
export const markAttendanceFromZoom = (meeting_id, catalyst_id,
  cohort_breakout_id, attentiveness_threshold = 70) => {
  const { ZOOM_BASE_URL } = process.env;
  console.log('Marking attendance for Cohort Breakout id', cohort_breakout_id);

  return (request
    .get(`${ZOOM_BASE_URL}report/meetings/{meetingId}/participants`) // todo: need to assign delta user to zoom user
    .set('Authorization', `Bearer ${zoom_token}`)
    .set('User-Agent', 'Zoom-api-Jwt-Request')
    .set('content-type', 'application/json')
    .then(data => {
      // TODO: Handle pagination if more than 30 attendees
      const {
        participants,
        total_records,
        next_page_token
      } = data.body;
      console.log(`Fetched data for Zoom Meeting: ${meeting_id}`);
      markIndividualAttendance(participants, catalyst_id,
        cohort_breakout_id, attentiveness_threshold)
        .then(attendanceCount => {
          console.log('Attendance Count.', attendanceCount);
          CohortBreakout.update({
            attendance_count: attendanceCount,
          }, {
            where: {
              cohort_breakout_id,
            },
          });
        })
        .catch(err => {
          console.error('Failed to update Cohort attendance count', err);
          return {
            text: `Failed to update Cohort attendance count for ${cohort_breakout_id} .`,
          };
        });
    })
    .catch(err => {
      console.log(err);
      return {
        text: `Failed to get breakout details from Zoom ${cohort_breakout_id}`,
      };
    })
  );
};
