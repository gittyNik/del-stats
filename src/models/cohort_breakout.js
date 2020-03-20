import { Sequelize, Op } from 'sequelize';
import uuid from 'uuid/v4';
import _ from 'lodash';
import db from '../database';
import { Cohort } from './cohort';
import { createSandbox } from './code_sandbox';
import { createScheduledMeeting, deleteMeetingFromZoom, markAttendanceFromZoom } from './video_meeting';
import { Topic } from './topic';
import { createBreakoutsInMilestone, BreakoutTemplate } from './breakout_template';

// import sandbox from 'bullmq/dist/classes/sandbox';

export const EVENT_STATUS = ['scheduled', 'started', 'cancelled', 'aborted', 'running', 'completed'];
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
  status: 'completed',
});

export const markComplete = (topic_id, cohort_id) => CohortBreakout.update({
  status: 'completed',
}, {
  where: { topic_id, cohort_id },
});

// If cohort breakouts exist mark cohort breakout complete
// Fetch zoom url and mark attendance
// mark learner attendance in learner breakouts
// update total attendance count for learners in cohort breakouts
// If cohort breakout does not exist, create
export const createOrUpdateCohortBreakout = (cohort_topic_id,
  cohort_id, time_scheduled) => Cohort.findOne(
  {
    attributes: ['duration', 'program_id'],
    where: {
      id: cohort_id,
    },
  },
).then(cohortDetails => {
  const { duration, program_id } = cohortDetails;
  return BreakoutTemplate.findOne({
    attributes: ['id', 'topic_id'],
    where: {
      cohort_duration: duration,
      program_id,
      topic_id: { [Op.contains]: [cohort_topic_id] },
    },
  }).then(breakoutTemplate => {
    const { id, topic_id } = breakoutTemplate;
    if (_.isEmpty(breakoutTemplate)) {
      return startBreakout(cohort_topic_id, cohort_id, time_scheduled);
      // eslint-disable-next-line no-else-return
    } else {
      return markComplete(cohort_topic_id, cohort_id).then(cohortBreakout => {
        return CohortBreakout.findOne({
          attributes: ['id', 'details', 'catalyst_id'],
          where: {
            cohort_id,
            topic_id: cohort_topic_id,
            breakout_template_id: id,
          },
        }).then(cohort_breakout_details => {
          const { join_url } = cohort_breakout_details.details.zoom;
          const { catalyst_id, id: cohort_breakout_id } = cohort_breakout_details;
          let mettingDetails = join_url.split('/')[4];
          let meetingId = mettingDetails.split('?')[0];
          return markAttendanceFromZoom(meetingId, catalyst_id, cohort_breakout_id);
        });
      });
    }
  });
});

export const createNewBreakout = (
  breakout_template_id, topic_id, cohort_id,
  time_scheduled, duration, location,
  catalyst_id, details,
  attendance_count = null, domain = null,
  catalyst_notes = null, catalyst_feedback = null,
) => {
  console.log(`${time_scheduled} ${duration} ${location}`);
  return CohortBreakout.create({
    id: uuid(),
    breakout_template_id,
    domain,
    topic_id: topic_id[0],
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

export const createBreakouts = (req, res) => {
  let {
    cohort_id, cohort_program_id, cohort_duration,
  } = req.body;
  createBreakoutsInMilestone(cohort_id, cohort_program_id, cohort_duration).then((data) => {
    res.status(201).json({ data });
  })
    .catch(err => res.status(500).send({ err }));
};

export const BreakoutWithOptions = (breakoutObject) => {
  const {
    topic_id, cohort_id, breakout_template_id, time_scheduled,
    duration, location, catalyst_id, details,
    isVideoMeeting, isCodeSandbox, topic_name, cohortName,
  } = breakoutObject;

  let time = time_scheduled.toLocaleString().split(' ').join('T');
  let zoomTopic = `Cohort ${cohortName} - Breakout \n\n Topics: \n ${details.topics} \n\n ${location}`;
  let agenda = `Cohort ${cohortName} \n\n Breakout is scheduled for the topics \n "${details.topics}" at ${time_scheduled} for ${duration} hours `;

  if (isCodeSandbox && isVideoMeeting) {
    return Promise.all([
      createSandbox(details.sandbox.template),
      createScheduledMeeting(zoomTopic, time, duration, agenda),
    ])
      .then(([sandbox, videoMeeting]) => {
        // console.log('Sandbox: ', sandbox);
        // console.log('VideoMeeting: ', videoMeeting);

        details.sandbox.sandbox_id = sandbox.sandbox_id;
        details.zoom = videoMeeting;
        return createNewBreakout(
          breakout_template_id, topic_id, cohort_id,
          time_scheduled, duration, location,
          catalyst_id, details,
        )
          .then(data => {
            // console.log('Breakout created with codesandbox and videoMeeting');
            // res.send('Breakout Created with codesandbox and videomeeting.');
            return data.toJSON();
          });
      });
    // eslint-disable-next-line no-else-return
  } else if (isCodeSandbox) {
    return createSandbox(details.sandbox.template).then(sandbox_value => {
      details.sandbox.sandbox_id = sandbox_value.data.sandbox_id;
      return createNewBreakout(
        breakout_template_id, topic_id, cohort_id,
        time_scheduled, duration, location,
        catalyst_id, details,
      ).then(data => {
        console.log('Breakout created with code sandbox only', data);
        return data;
      });
    });
  } else if (isVideoMeeting) {
    return createScheduledMeeting(zoomTopic, time, duration, agenda)
      .then(videoMeeting => {
        details.zoom = videoMeeting;
        return createNewBreakout(
          breakout_template_id, topic_id, cohort_id,
          time_scheduled, duration, location,
          catalyst_id, details,
        )
          .then(data => {
            console.log('Breakout and video meeting created Created', data);
            return data;
          });
      })
  } else {
    return createNewBreakout(
      breakout_template_id, topic_id, cohort_id,
      time_scheduled, duration, location,
      catalyst_id, details,
    )
      .then(data => {
        console.log('Breakout created without video meeting created Created', data);
        return data;
      });
  }
};


export const createCohortBreakouts = (breakoutTemplateList, cohort_id) => {
  return Cohort.findByPk(cohort_id, {
    attributes: ['location', 'name'],
    raw: true,
  })
    .then((cohort) => {
      console.log(cohort.location);
      let BreakoutObjects = breakoutTemplateList.map((breakoutTemplate) => {
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
          cohortName: cohort.name,
        };
        return breakoutObject;
        // end of map
      });
      return BreakoutObjects;
      // end of first then.
    })
    .then(async (breakoutsWithCohortName) => {
      let breakouts = [];
      for (let i = 0; i < breakoutsWithCohortName.length; i++) {
        let breakout = BreakoutWithOptions(breakoutsWithCohortName[i]);
        breakouts.push(breakout);
      }
      console.log('<----- BREAKOUT OBJECT -------->', breakouts.length);
      return Promise.all(breakouts);
    })
    .catch(err => {
      console.error('Failed to location for a cohort', err);
      return null;
    });
};


export const getAllBreakoutsInCohort = (cohort_id) => {
  return CohortBreakout.findAll({
    where: {
      cohort_id,
    },
    raw: true,
  })
    .then(allBreakouts => {
      return allBreakouts;
    })
    .catch(err => {
      console.error('Unable to find all breakouts in the cohort', err);
      return null;
    });
};

export const getAllBreakoutsInCohortMilestone = (cohort_id, milestone_id) => {
  return Topic.findAll({
    where: {
      milestone_id,
    },
    raw: true,
  })
    .then(async (topics) => {
      let breakouts = await topics.map(async (topic) => {
        // console.log('TOPIC', topic);
        let breakout = await CohortBreakout.findOne({
          where: {
            topic_id: topic.id,
            cohort_id,
          },
          include: [Topic],
          raw: true,
        })
          .then(data => {
            console.log('SINGLE BREAKOUT', data);
            return data;
          })
          .catch(err => {
            console.log(err);
            return null;
          });
        return breakout;
      });
      // console.log('BREAKOUTS: ', (breakouts));
      return Promise.all(breakouts);
    })
    .catch(err => {
      console.log('Unable to find topics for the milestone', err);
      return null;
    });
};
