import Sequelize from 'sequelize';
import uuid from 'uuid/v4';
import db from '../database';
import { Cohort } from './cohort';
import { createSandbox } from './code_sandbox';
import { createScheduledMeeting, deleteMeetingFromZoom } from './video_meeting';

export const EVENT_STATUS = ['scheduled', 'started', 'cancelled', 'aborted', 'running'];
export const BREAKOUT_TYPE = ['lecture', 'codealong', 'questionhour', 'activity', 'groupdiscussion'];

export const CohortBreakout = db.define('cohort_breakouts', {
  id: {
    type: Sequelize.UUID,
    primaryKey: true,
  },
  type: {
    type: Sequelize.ENUM(...BREAKOUT_TYPE),
    defaultValue: 'lecture',
  },
  breakout_template_id: {
    type: Sequelize.UUID,
    references: { model: 'breakout_templates' },
  },
  domain: Sequelize.STRING,
  topic_id: Sequelize.UUID,
  cohort_id: Sequelize.UUID,
  time_scheduled: {
    type: Sequelize.DATE,
    allowNull: false,
  },
  duration: {
    type: Sequelize.INTEGER,
    defaultValue: 1800000, // half an hour in milliseconds
  },
  location: Sequelize.STRING,
  catalyst_id: Sequelize.UUID,
  status: {
    type: Sequelize.ENUM(...EVENT_STATUS),
    defaultValue: 'scheduled',
  },
  catalyst_notes: Sequelize.TEXT,
  catalyst_feedback: Sequelize.TEXT,
  attendance_count: Sequelize.INTEGER,
  details: Sequelize.JSON, // { meetingId url, codesandbox }
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

export const scheduleBreakoutLecture = (topic_id, cohort_id, time_scheduled) => {
  console.log(time_scheduled);
  return CohortBreakout.create({
    id: uuid(),
    topic_id,
    cohort_id,
    time_scheduled,
  });
};

export const startBreakout = (topic_id, cohort_id, time_scheduled) => CohortBreakout.create({
  id: uuid(),
  topic_id,
  cohort_id,
  time_scheduled,
  status: 'started',
});

export const createNewBreakout = (
  breakout_template_id, topic_id, cohort_id,
  time_scheduled, duration, location,
  catalyst_id, details,
  attendance_count = null, domain = null,
  catalyst_notes = null, catalyst_feedback = null,
) => {
  CohortBreakout.create({
    id: uuid(),
    breakout_template_id,
    domain,
    topic_id,
    cohort_id,
    time_scheduled,
    duration,
    location,
    catalyst_id,
    catalyst_notes,
    attendance_count,
    catalyst_feedback,
    details,
  });
};

export const BreakoutWithOptions = (breakoutObject) => {
  const {
    topic_id, cohort_id, breakout_template_id, time_scheduled,
    duration, location, catalyst_id, details,
    isVideoMeeting, isCodeSandbox, topic_name
  } = breakoutObject;

  let time = time_scheduled.toLocaleString().split(' ').join('T');
  let agenda = `Breakout is scheduled for the topic "${topic_name}" at ${time_scheduled} for ${duration} hours `;

  if (isCodeSandbox && isVideoMeeting) {
    Promise.all([
      createSandbox(details.sandbox.template),
      createScheduledMeeting(topic_name, time, duration, agenda),
    ])
      .then(([sandbox, videoMeeting]) => {
        console.log('Sandbox: ', sandbox);
        console.log('VideoMeeting: ', videoMeeting);

        details.sandbox.sandbox_id = sandbox.data.sandbox_id;
        details.zoom = videoMeeting;
        createNewBreakout(
          breakout_template_id, topic_id, cohort_id,
          time_scheduled, duration, location,
          catalyst_id, details,
        )
          .then(data => {
            console.log('Breakout created with codesandbox and videoMeeting', data);
            // res.send('Breakout Created with codesandbox and videomeeting.');
            return data;
          })
          .catch(err => {
            deleteMeetingFromZoom(details.videoMeeting_id);
            console.error('Failed to create Cohort Breakout', err);
            return `Failed to create Cohort Breakout for breakout_template_id ${breakout_template_id}`;
          });
      })
      .catch(err => {
        console.log('Failed to create Code Sanbdbox and Videomeeting', err);
        return null;
      });
  } else if (isCodeSandbox) {
    createSandbox(details.sandbox.template)
      .then(sandbox => {
        // console.log(data);
        details.sandbox.sandbox_id = sandbox.data.sandbox_id;
        createNewBreakout(
          breakout_template_id, topic_id, cohort_id,
          time_scheduled, duration, location,
          catalyst_id, details,
        )
          .then(data => {
            console.log('Breakout created with code sandbox only', data);
            return data;
          })
          .catch(err => {
            console.error('Failed to create Breakout', err);
            return 'Failed to create Breakout';

          });
      })
      .catch(err => {
        console.log('Failed to create codesandbox', err);
        return null;
      });
  } else if (isVideoMeeting) {
    createScheduledMeeting(topic_id, time, duration, agenda)
      .then(videoMeeting => {
        details.zoom = videoMeeting;
        createNewBreakout(
          breakout_template_id, topic_id, cohort_id,
          time_scheduled, duration, location,
          catalyst_id, details,
        )
          .then(data => {
            console.log('Breakout and video meeting created Created', data);
            return data;
          })
          .catch(err => {
            deleteMeetingFromZoom(details.videoMeeting_id);
            console.error('Failed to create Breakout after creating video meeting', err);
            return 'Failed to create Breakout after creating video meeting';
          });
      })
      .catch(err => {
        // todo: Remove the scheduled meeting from zoom  and deltaDB - delete.
        console.log('failed to create videoMeeting', err);
        return null;
      });
  } else {
    createNewBreakout(
      breakout_template_id, topic_id, cohort_id,
      time_scheduled, duration, location,
      catalyst_id, details,
    )
      .then(data => {
        console.log('Breakout created without video meeting created Created', data);
        return data;
      })
      .catch(err => {
        deleteMeetingFromZoom(details.videoMeeting_id);
        console.error('Failed to create Breakout', err);
        return null;
      });
  }
};


export const createCohortBreakouts = (breakoutTemplateList, cohort_id) => {
  return Cohort.findByPk(cohort_id, {
    attributes: ['location'],
    raw: true,
  })
    .then(async (cohort) => {
      console.log(cohort.location);
      let BreakoutObjects = await breakoutTemplateList.map(async (breakoutTemplate) => {
        let {
          id, name, topic_id, duration, primary_catalyst,
          breakout_schedule, details,
        } = breakoutTemplate;
        let breakoutObject = {
          topic_id,
          cohort_id,
          breakout_template_id: id,
          time_scheduled: breakout_schedule,
          duration,
          location: cohort.location,
          catalyst_id: primary_catalyst,
          details,
          topic_name: name,
          isVideoMeeting: true,
          isCodeSandbox: true,
        };
        return breakoutObject;
        // end of map
      });
      return Promise.all(BreakoutObjects);
      // end of first then.
    })
    .then(async (breakoutObjects) => {
      let breakouts = await breakoutObjects.map(async (breakoutObject) => {
        let breakout = await BreakoutWithOptions(breakoutObject);
        return breakout;
      });
      console.log('<----- BREAKOUT OBJECT -------->', breakouts);
      return breakouts;
    })
    .catch(err => {
      console.error('Failed to location for a cohort', err);
      return null;
    });
};

