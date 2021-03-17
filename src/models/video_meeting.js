import Sequelize from 'sequelize';
import request from 'superagent';
import { v4 as uuid } from 'uuid';
import jwt from 'jsonwebtoken';
import _ from 'lodash';
import db from '../database';
import { LearnerBreakout } from './learner_breakout';
import { SocialConnection } from './social_connection';
import { CohortBreakout } from './cohort_breakout';
import { User, getUserByEmail } from './user';
import { changeTimezone } from './breakout_template';
import {
  notifyAttendanceLearnerInChannel,
} from '../integrations/slack/delta-app/controllers/web.controller';
import {
  getLearnerAttendanceForBreakout,
} from '../controllers/learning/learner_breakout.controller';
import logger from '../util/logger';

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
  host_video: false,
  participant_video: false,
  in_meeting: true,
  join_before_host: true,
  mute_upon_entry: true,
  watermark: false,
  use_pmi: false,
  approval_type: 2,
  audio: 'both',
  auto_recording: 'local', // options: local, cloud and none
  enforce_login: true,
  // alternative_hosts: process.env.ZOOM_HOSTS,
  waiting_room: false,
  meeting_authentication: true,
};

export const deleteMeetingFromZoom = (video_id) => {
  const { ZOOM_BASE_URL } = process.env;
  request
    .delete(`${ZOOM_BASE_URL}meetings/${video_id}`)
    .set('Authorization', `Bearer ${zoom_token}`)
    .set('User-Agent', 'Zoom-api-Jwt-Request')
    .then(async data => {
      if (data.status === 204) {
        await VideoMeeting.destroy(
          { where: { video_id } },
        );
        // console.log('Meeting successfully deleted');
        return true;
      }
      logger.error(`failed to delete Meeting ${video_id}`);
      return false;
    })
    .catch(err => {
      logger.error(err);
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
// TODO: Standarise breakout timings to UTC
export const createScheduledMeeting = async (topic, start_time,
  millisecs_duration, agenda, type, catalyst_id = null,
  timezone = 'Asia/Calcutta') => {
  let catalyst_email;
  let host_key;

  let meetingSettings = { ...MEETING_SETTINGS };

  if (catalyst_id !== null) {
    let catalyst_details = await User.findOne({
      where: {
        role: { [Sequelize.Op.not]: 'catalyst' },
        id: catalyst_id,
      },
      attributes: ['email'],
    });
    if (catalyst_details) {
      catalyst_email = catalyst_details.email;
      meetingSettings.auto_recording = 'local';
    }
  }

  const { ZOOM_BASE_URL, ZOOM_USER, HOST_KEYS } = process.env;
  let zoom_user_array = ZOOM_USER.split(',');
  let host_key_arrays = HOST_KEYS.split(',');

  const duration = millisecondsToMinutes(millisecs_duration);

  let db_update_time = start_time.toISOString();
  let zoom_start_time = start_time.toLocaleString().split(' ').join('T');

  const meeting_object = {
    topic,
    type: type || 2, // defaults to scheduled Meeting
    start_time: zoom_start_time,
    duration,
    timezone,
    password: 'soal',
    agenda,
    settings: meetingSettings,
  };

  console.log(`Catalyst email for meeting: ${catalyst_email}`);
  // Logic for using Pro Zoom accounts
  if ((catalyst_email === null) || (catalyst_email === undefined)) {
    // logger.info('trying to create meeting');
    // Calculate End time for Meeting
    let starting_time = new Date(start_time);
    start_time = starting_time.toISOString();
    let end_time = new Date(start_time);
    end_time.setMinutes(end_time.getMinutes() + duration);
    end_time = end_time.toISOString();

    // Check if Meeting exist between same start and end time
    let concurrent_meet = await VideoMeeting.findAll({
      where: {
        zoom_user: { [opIn]: zoom_user_array },
        start_time: { [between]: [starting_time, end_time] },
      },
      logging: console.log,
    });
    console.log(`Concurrent meetings: ${concurrent_meet}`);
    let zoom_user_index = 0;

    // Meetings will be created in a particular order of user id
    // All meetings will be created with 1st account
    // If meeting at that time exist, with 2nd and so on
    if (concurrent_meet) {
      zoom_user_index = concurrent_meet.length;
    }

    catalyst_email = zoom_user_array[zoom_user_index];
    host_key = host_key_arrays[zoom_user_index];
    if (catalyst_email === undefined) {
      [catalyst_email] = zoom_user_array;
      [host_key] = host_key_arrays;
    }
  }

  return (request
    .post(`${ZOOM_BASE_URL}users/${catalyst_email}/meetings`) // todo: need to assign delta user to zoom user
    .send(meeting_object)
    .set('Authorization', `Bearer ${zoom_token}`)
    .set('User-Agent', 'Zoom-api-Jwt-Request')
    .set('content-type', 'application/json')
    .then(data => {
      // logger.info(data);
      const {
        id, status,
        start_url, join_url, h323_password,
      } = data.body;
      let updated_start_url;
      let updated_join_url;
      if (start_url.length > 200) {
        updated_start_url = start_url.substring(0, 200);
      } else {
        updated_start_url = start_url;
      }
      if (join_url.length > 200) {
        updated_join_url = join_url.substring(0, 200);
      } else {
        updated_join_url = join_url;
      }
      // logger.log(`ZOOM MEETING --> id: ${id}, status: ${status}, join_url: ${join_url}`);
      return VideoMeeting.create({
        id: uuid(),
        video_id: id,
        start_url: updated_start_url,
        join_url: updated_join_url,
        duration,
        start_time: db_update_time,
        zoom_user: catalyst_email,
      })
        .then(video =>
          // logger.info('meeting updated in db.');
          // logger.info(video);
          ({
            id,
            status,
            start_url,
            join_url,
            host_key,
          }))
        .catch(err => {
          // todo: delete the meeting from Zoom.
          deleteMeetingFromZoom(id);
          logger.error('meeting created on zoom but error in storing to DB', err);
          return {
            text: 'Failed to save the video details on DB.',
          };
        });
    })
    .catch(err => {
      logger.error(err);
      return {
        text: 'Failed to create meeting',
      };
    })
  );
};

export const learnerAttendance = async (participant, catalyst_id,
  cohort_breakout_id, attentiveness_threshold, duration_threshold) => {
  const {
    user_email, duration, attentiveness_score, join_time,
  } = participant;
  let attentivenessScore = parseFloat(attentiveness_score);
  let durationTime = parseFloat(duration);
  // if (isNaN(attentivenessScore)) {
  //   attentivenessScore = attentiveness_threshold;
  // }
  let attendanceCount = 0;
  if (!user_email) {
    return 0;
  }
  let userConnection = await SocialConnection.findOne({
    attributes: ['user_id'],
    where: {
      email: user_email,
    },
    raw: true,
  });
  if (_.isEmpty(userConnection)) {
    let userDetails = await getUserByEmail(user_email);
    if (userDetails) {
      userConnection = {
        user_id: userDetails.id,
      };
    }
  }
  if (userConnection) {
    if (userConnection.user_id !== catalyst_id) {
      let attendance;
      if ((durationTime >= duration_threshold)) {
        attendanceCount += 1;
        attendance = true;
      } else {
        try {
          let inTime = Math.floor(durationTime / 60);
          let isPartOfCohort = await LearnerBreakout.findOne({
            where: {
              cohort_breakout_id,
              learner_id: userConnection.user_id,
            },
            raw: true,
          });
          if (isPartOfCohort) {
            notifyAttendanceLearnerInChannel(cohort_breakout_id, user_email, inTime);
          }
        } catch (err) {
          logger.error(`Error while sending message to learner: ${err}`);
        }
        attendance = false;
      }
      try {
        LearnerBreakout.update({
          attendance,
        }, {
          where: {
            cohort_breakout_id,
            learner_id: userConnection.user_id,
          },
        });
      } catch (err) {
        if (attendance) {
          attendanceCount -= 1;
        }
        if (err instanceof TypeError) {
          logger.error(`${user_email} not present in social connections`);
          logger.error(err);
        } else {
          logger.error(`${user_email} does not have learner breakout ${cohort_breakout_id}`);
          logger.error(err);
        }
      }
    } else {
      // Add time taken by Catalyst for breakout
      let breakoutTime = durationTime * 1000;
      await CohortBreakout.update({
        time_taken_by_catalyst: breakoutTime,
        time_started: join_time,
        update_at: Date.now(),
      }, {
        where: {
          id: cohort_breakout_id,
        },
      });
    }

    return attendanceCount;
  }
  return 0;
};

export const markIndividualAttendance = async (participants, catalyst_id,
  cohort_breakout_id, attentiveness_threshold, duration_threshold) => {
  let seen = {};
  participants = participants.filter((entry) => {
    let previous;

    // Have we seen this email before?
    if (entry.user_email in seen) {
      // Yes, grab it and add this data to it
      previous = seen[entry.user_email];
      previous.duration += entry.duration;

      // Don't keep this entry, we've merged it into the previous one
      return false;
    }

    // Remember that we've seen it
    seen[entry.user_email] = entry;

    // Keep this one, we'll merge any others that match into it
    return true;
  });
  const attendanceCount = Promise.all(participants.map(async (participant) => {
    try {
      let attendance_count = await learnerAttendance(participant, catalyst_id,
        cohort_breakout_id, attentiveness_threshold, duration_threshold);
      return attendance_count;
    } catch (err) {
      logger.error('error in finding user', err);
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
  // logger.info('Marking attendance for Cohort Breakout id', cohort_breakout_id);

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
      // logger.info(`Fetched data for Zoom Meeting: ${meeting_id}`);
      return markIndividualAttendance(
        participants, catalyst_id,
        cohort_breakout_id, attentiveness_threshold, duration_threshold,
      )
        .then(async attendanceCountArray => {
          const attendanceCount = attendanceCountArray.reduce(add);
          await CohortBreakout.update({
            attendance_count: attendanceCount,
            status: 'running',
            update_at: Date.now(),
          }, {
            where: {
              id: cohort_breakout_id,
            },
          });

          return getLearnerAttendanceForBreakout(cohort_breakout_id);
        });
    }));
};

export const updateVideoMeeting = async (meetingId, updatedTime) => {
  const { ZOOM_BASE_URL } = process.env;

  try {
    let dateupdatedTime = new Date(updatedTime);
    let updatedTimeZoneTime = changeTimezone(dateupdatedTime, 'Asia/Kolkata');

    let db_update_time = updatedTimeZoneTime.toISOString();
    let time = updatedTimeZoneTime.toLocaleString().split(' ').join('T');

    let response = await request
      .patch(`${ZOOM_BASE_URL}meetings/${meetingId}`)
      .set('Authorization', `Bearer ${zoom_token}`)
      .set('content-type', 'application/json')
      .send({
        start_time: time,
        // settings: MEETING_SETTINGS,
      });

    if (response.status === 204) {
      await VideoMeeting.update({
        start_time: db_update_time,
      }, {
        where: { video_id: meetingId },
        raw: true,
      });
      return true;
    }
    return false;
  } catch (err) {
    logger.error(`Error updating zoom meeting ${err}`);
    return false;
  }
};

export const updateCohortMeeting = async (cohort_breakout_id, updatedTime,
  newCatalyst_id, cohort_breakout) => {
  if (_.isEmpty(cohort_breakout)) {
    cohort_breakout = await CohortBreakout.findByPk(cohort_breakout_id);
  }
  let { details, catalyst_id, duration } = cohort_breakout.toJSON();
  let updated;
  updatedTime = new Date(updatedTime);
  let data = {};
  if (typeof details.zoom !== 'undefined') {
    if (typeof details.zoom.id === 'undefined') {
      updated = await createScheduledMeeting(details.topics,
        updatedTime, duration, null, 2, newCatalyst_id, 'UTC');
    }
  } else {
    updated = await createScheduledMeeting(details.topics,
      updatedTime, duration, null, 2, newCatalyst_id, 'UTC');
  }

  if ((newCatalyst_id !== null) && (catalyst_id !== newCatalyst_id)) {
    try {
      if (typeof details.zoom !== 'undefined') {
        if (typeof details.zoom.id !== 'undefined') {
          // delete calendar event for catalyst
          deleteMeetingFromZoom(details.zoom.id);
        }
      }
    } catch (error) {
      logger.warn('Unable to delete Zoom meeting');
      logger.warn(error);
    }
    updated = await createScheduledMeeting(details.topics,
      updatedTime, duration, null, 2, newCatalyst_id, 'UTC');
  } else {
    if (typeof details.zoom !== 'undefined') {
      if (typeof details.zoom.id !== 'undefined') {
        try {
          updated = await updateVideoMeeting(details.zoom.id, updatedTime);
        } catch (err) {
          // Handling cases where videoMeeting_id is key
          updated = await updateVideoMeeting(details.videoMeeting_id.id, updatedTime);
        }
      }
    } else {
      updated = await createScheduledMeeting(details.topics,
        updatedTime, duration, null, 2, newCatalyst_id, 'UTC');
    }
    if (updated) {
      updated = details.zoom;
    }
  }

  if (updated) {
    data.zoom = updated;
    return data;
  }
  data.error = 'Unable to update zoom meeting';
  return data;
};
