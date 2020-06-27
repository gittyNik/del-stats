import Sequelize from 'sequelize';
import request from 'superagent';
import uuid from 'uuid/v4';
import jwt from 'jsonwebtoken';
import db from '../database';
import { LearnerBreakout } from './learner_breakout';
import { SocialConnection } from './social_connection';
import { CohortBreakout } from './cohort_breakout';

const { in: opIn, between } = Sequelize.Op;

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
  zoom_user: Sequelize.STRING,
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
  host_video: true,
  participant_video: true,
  in_meeting: true,
  join_before_host: true,
  mute_upon_entry: true,
  watermark: false,
  use_pmi: false,
  approval_type: 2,
  audio: 'both',
  auto_recording: 'cloud', // options: local, cloud and none
  enforce_login: true,
  // alternative_hosts: process.env.ZOOM_HOSTS,
  waiting_room: false,
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

function millisecondsToMinutes(millis) {
  let minutes = Math.floor(millis / 60000);
  return minutes;
}

/*
Meeting type:
  1- Instant meeting
  2- Scheduled Meeting
  3- Recurring Meeting with no fixed time
  4- Recurring Meeting with a fixed time
*/
export const createScheduledMeeting = async (topic, start_time,
  millisecs_duration, agenda, type) => {
  const { ZOOM_BASE_URL, ZOOM_USER } = process.env;
  let zoom_user_array = ZOOM_USER.split(',');
  const duration = millisecondsToMinutes(millisecs_duration);
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
  console.log('trying to create meeting');

  // Calculate End time for Meeting
  let end_time = new Date(start_time + (duration * 60 * 1000));

  // Check if Meeting exist between same start and end time
  let concurrent_meet = await VideoMeeting.findAll({
    where: {
      zoom_user: { [opIn]: zoom_user_array },
      start_time: { [between]: [start_time, end_time] },
    },
  });
  let zoom_user_index = 0;
  let zoom_user;

  // Meetings will be created in a particular order of user id
  // All meetings will be created with 1st account
  // If meeting at that time exist, with 2nd and so on
  if (concurrent_meet) {
    zoom_user_index = concurrent_meet.length;
  }
  try {
    zoom_user = zoom_user_array[zoom_user_index];
  } catch (err) {
    [zoom_user] = zoom_user_array;
  }

  return (request
    .post(`${ZOOM_BASE_URL}users/${zoom_user}/meetings`) // todo: need to assign delta user to zoom user
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
        start_time,
      })
        .then(video => {
          console.log('meeting updated in db.');
          // console.log(video);
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

export const learnerAttendance = async (participant, catalyst_id,
  cohort_breakout_id, attentiveness_threshold, duration_threshold) => {
  const { user_email, duration, attentiveness_score } = participant;
  let attentivenessScore = parseFloat(attentiveness_score);
  let durationTime = parseFloat(duration);
  // if (isNaN(attentivenessScore)) {
  //   attentivenessScore = attentiveness_threshold;
  // }
  let attendanceCount = 0;
  if (!user_email) {
    return 0;
  }
  return SocialConnection.findOne({
    attributes: ['user_id'],
    where: {
      email: user_email,
    },
  }).then(data => {
    let attendance;
    if ((durationTime >= duration_threshold) && (data.user_id !== catalyst_id)) {
      attendanceCount += 1;
      attendance = true;
    } else {
      attendance = false;
    }
    try {
      LearnerBreakout.update({
        attendance,
      }, {
        where: {
          cohort_breakout_id,
          learner_id: data.user_id,
        },
      });
    } catch (err) {
      if (attendance) {
        attendanceCount -= 1;
      }
      if (err instanceof TypeError) {
        console.log(`${user_email} not present in social connections`);
      } else {
        console.log(`${user_email} does not have learner breakout ${cohort_breakout_id}`);
      }
    }
    return attendanceCount;
  });
};

export const markIndividualAttendance = async (participants, catalyst_id,
  cohort_breakout_id, attentiveness_threshold, duration_threshold) => {
  const attendanceCount = Promise.all(participants.map(async (participant) => {
    try {
      let attendance_count = await learnerAttendance(participant, catalyst_id,
        cohort_breakout_id, attentiveness_threshold, duration_threshold);
      return attendance_count;
    } catch (err) {
      console.log('error in finding user', err);
      return 0;
    }
  }));
  return attendanceCount;
};

// function for adding two numbers
const add = (a, b) => a + b;

/*
From Zoom API endpoint get users in breakout and mark attendance for them
https://marketplace.zoom.us/docs/api-reference/zoom-api/reports/reportmeetingparticipants
Zoom returns the users that attended a meeting, using this to mark attendance
*/
export const markAttendanceFromZoom = (meeting_id, catalyst_id,
  cohort_breakout_id, attentiveness_threshold = 70, duration_threshold = 600) => {
  const { ZOOM_BASE_URL } = process.env;
  const page_size = 100;
  console.log('Marking attendance for Cohort Breakout id', cohort_breakout_id);

  return (request
    .get(`${ZOOM_BASE_URL}report/meetings/${meeting_id}/participants?page_size=${page_size}`) // todo: need to assign delta user to zoom user
    .set('Authorization', `Bearer ${zoom_token}`)
    .set('User-Agent', 'Zoom-api-Jwt-Request')
    .set('content-type', 'application/json')
    .then(data => {
      // TODO: Handle pagination if more than 30 attendees
      const {
        participants,
        total_records,
        next_page_token,
      } = data.body;
      console.log(`Fetched data for Zoom Meeting: ${meeting_id}`);
      return markIndividualAttendance(
        participants, catalyst_id,
        cohort_breakout_id, attentiveness_threshold, duration_threshold,
      )
        .then(attendanceCountArray => {
          const attendanceCount = attendanceCountArray.reduce(add);
          console.log('Attendance Count.', attendanceCount);
          return CohortBreakout.update({
            attendance_count: attendanceCount,
            update_at: Date.now(),
          }, {
            where: {
              id: cohort_breakout_id,
            },
          });
        }).catch(err => {
          console.error('Failed to update Cohort attendance count', err);
          return {
            text: `Failed to update Cohort attendance count for ${cohort_breakout_id} .`,
          };
        });
    })
    .catch(err =>
      // console.log(err);
      ({
        text: `Failed to get breakout details from Zoom ${cohort_breakout_id}`,
      }))
  );
};

export const updateVideoMeeting = async (meetingId, updatedTime) => {
  const { ZOOM_BASE_URL } = process.env;

  let response = await request
    .patch(`${ZOOM_BASE_URL}meetings/${meetingId}`)
    .set('Authorization', `Bearer ${zoom_token}`)
    .set('content-type', 'application/json')
    .send({
      start_time: updatedTime,
      // settings: MEETING_SETTINGS,
    });

  if (response.status === 204) {
    return true;
  }
  return false;
};

export const updateCohortMeeting = async (cohort_breakout_id, updatedTime) => {
  let cohort_breakout = await CohortBreakout.findByPk(cohort_breakout_id);
  let { details } = cohort_breakout.toJSON();
  if (details.zoom.id === undefined) {
    return `No zoom meeting available to update ${cohort_breakout_id}`;
  }

  let updated = updateVideoMeeting(details.zoom.id, updatedTime);
  let data = {};
  if (updated) {
    data.zoom = { id: details.zoom.id };

    data.cohort_breakout = await CohortBreakout
      .update(
        { time_scheduled: updatedTime },
        { returning: true, where: { id: cohort_breakout_id } },
      )
      .then(([rowsUpdated, updatedCB]) => {
        // console.log(rowsUpdated);
        // console.log(updatedCB[0]);
        console.log(`Cohort breakout ${cohort_breakout_id} updated to ${updatedTime}`);
        return updatedCB[0].toJSON();
      })
      .catch((err) => {
        console.error(err);
        return `Error updating cohort breakout ${cohort_breakout_id}`;
      });
    return data;
  }
  data.error = 'Unable to update zoom meeting';
  return data;
};
