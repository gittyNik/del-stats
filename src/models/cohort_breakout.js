import { Sequelize, Op } from 'sequelize';
import uuid from 'uuid/v4';
import _ from 'lodash';
import db from '../database';
import {
  Cohort,
  getLearnersForCohort,
} from './cohort';
import {
  getTopicIdsByMilestone,
  getTopicNameById,
  Topic,
  getTopicDataById,
} from './topic';
import {
  LearnerBreakout,
  createLearnerBreakoutsForCohortMilestones,
  createAllLearnerBreakoutsForCurrentMS,
  createAllLearnerBreakout,
} from './learner_breakout';
import { createSandbox } from './code_sandbox';
import {
  createScheduledMeeting,
  markAttendanceFromZoom,
} from './video_meeting';

import { BreakoutTemplate } from './breakout_template';
import {
  getUsersWithStatus,
} from './user';
import {
  getDataForMilestoneName,
} from './cohort_milestone';
import {
  showCompletedBreakoutOnSlack,
} from '../integrations/slack/team-app/controllers/milestone.controller';
import { postAttendaceInCohortChannel, postTodaysBreakouts } from '../integrations/slack/delta-app/controllers/web.controller';
import { getGoogleOauthOfUser } from '../util/calendar-util';
import { createEvent, deleteEvent, updateEvent } from '../integrations/calendar/calendar.model';
import { logger } from '../util/logger';
import { getChannelIdForCohort, getSlackIdForLearner } from './slack_channels';
// import sandbox from 'bullmq/dist/classes/sandbox';

export const EVENT_STATUS = [
  'scheduled',
  'started',
  'cancelled',
  'aborted',
  'running',
  'completed',
  'review-shared',
];
export const BREAKOUT_TYPE = [
  'lecture',
  'codealong',
  'questionhour',
  'activity',
  'groupdiscussion',
  'reviews',
  'assessment',
  '1on1',
];

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
  team_feedback: Sequelize.JSON,
  updated_by: {
    type: Sequelize.ARRAY(
      {
        type: Sequelize.UUID,
        references: { model: 'users' },
      },
    ),
    allowNull: true,
  },
  time_taken_by_catalyst: {
    type: Sequelize.INTEGER,
  },
  time_started: {
    type: Sequelize.DATE,
  },
});

export const findOneCohortBreakout = (
  whereObject, attributesObj, includeObj, orderObj,
) => CohortBreakout.findOne({
  where: whereObject,
  include: includeObj,
  order: orderObj,
  attributes: attributesObj,
})
  .then(data => data)
  .catch(err => console.log(err));

export const findAllCohortBreakout = (
  where, attributes, include, order,
  skip = 0, limit = 10,
) => CohortBreakout.findAll({
  where,
  include,
  order,
  attributes,
  offset: skip,
  limit,
});

export const scheduleBreakoutLecture = (
  topic_id,
  cohort_id,
  time_scheduled,
) => CohortBreakout.create({
  id: uuid(),
  topic_id,
  cohort_id,
  time_scheduled,
});

export const startBreakout = (
  topic_id,
  cohort_id,
  time_scheduled,
  details,
  status = 'started',
  duration = 1800000,
) => {
  if (typeof topic_id !== 'undefined') {
    return CohortBreakout.create({
      id: uuid(),
      cohort_id,
      topic_id,
      time_scheduled,
      status,
      details,
      duration,
    });
  }
  return CohortBreakout.create({
    id: uuid(),
    cohort_id,
    time_scheduled,
    status,
    details,
    duration,
  });
};

export const markZoomAttendance = (cohort_breakout_details) => {
  try {
    const { join_url } = cohort_breakout_details.details.zoom;
    const { catalyst_id, id: cohort_breakout_id } = cohort_breakout_details;
    let mettingDetails = join_url.split('/')[4];
    let meetingId = mettingDetails.split('?')[0];
    return markAttendanceFromZoom(meetingId, catalyst_id, cohort_breakout_id);
  } catch (err) {
    // If meeting does not have zoom url
    // If zoom meeting url creation has failed
    console.warn('Meeting missing Zoom url');
    // console.warn(cohort_breakout_details);
    return { message: 'Meeting marked as complete' };
  }
};

export const markBreakoutComplete = (breakout_id) => CohortBreakout.update(
  {
    status: 'completed',
    updated_at: Date.now(),
  },
  {
    where: { id: breakout_id },
    returning: true,
    plain: true,
  },
);

export const markComplete = (topic_id, cohort_id) => CohortBreakout.update(
  {
    status: 'completed',
    updated_at: Date.now(),
  },
  {
    where: { topic_id, cohort_id },
    returning: true,
    plain: true,
  },
);

export const checkForAttendance = (cohort_id, topic_id) => CohortBreakout.findOne({
  attributes: ['id', 'details', 'catalyst_id'],
  where: {
    cohort_id,
    topic_id,
  },
}).then((cohort_breakout_details) => markZoomAttendance(cohort_breakout_details));

export const markStatusAndAttendance = (
  breakoutTemplate,
  cohort_topic_id,
  cohort_id,
  time_scheduled,
) => {
  let breakout_topic_id;
  if (_.isEmpty(breakoutTemplate)) {
    breakout_topic_id = cohort_topic_id;
    // eslint-disable-next-line no-else-return
  } else {
    const { topic_id } = breakoutTemplate;
    [breakout_topic_id] = topic_id;
  }
  return checkForAttendance(cohort_id, breakout_topic_id).then((attendance) => {
    if (_.isEmpty(breakoutTemplate)) {
      return startBreakout(
        breakout_topic_id,
        cohort_id,
        time_scheduled,
        {},
        'completed',
      );
    }
    return markComplete(breakout_topic_id, cohort_id);
  });
};

// If cohort breakouts exist mark cohort breakout complete
// Fetch zoom url and mark attendance
// mark learner attendance in learner breakouts
// update total attendance count for learners in cohort breakouts
// If cohort breakout does not exist, create
export const createOrUpdateCohortBreakout = (
  cohort_topic_id,
  cohort_id,
  time_scheduled,
  name = '',
) => Cohort.findOne({
  attributes: ['duration', 'program_id'],
  where: {
    id: cohort_id,
  },
}).then((cohortDetails) => {
  const { duration, program_id } = cohortDetails;
  return BreakoutTemplate.findOne({
    attributes: ['id', 'topic_id'],
    where: {
      cohort_duration: duration,
      program_id,
      topic_id: { [Op.contains]: [cohort_topic_id] },
    },
  }).then((breakoutTemplate) => markStatusAndAttendance(
    breakoutTemplate,
    cohort_topic_id,
    cohort_id,
    time_scheduled,
  )).then(showCompletedBreakoutOnSlack(cohort_topic_id, cohort_id, name));
});

export const markBreakoutFinished = (
  cohort_breakout_id, name = '',
) => markBreakoutComplete(cohort_breakout_id)
  .then((completeBreakout) => Promise.all([
    markZoomAttendance(completeBreakout[1]),
    showCompletedBreakoutOnSlack(
      completeBreakout[1].topicId,
      completeBreakout[1].cohortId,
      name,
      cohort_breakout_id,
    ),
  ]))
  .then(async (data) => {
    const slackResponse = await postAttendaceInCohortChannel(cohort_breakout_id);
    data.slackNotify = (slackResponse.ok) ? 'Notified on Slack' : slackResponse.error;
    return data;
  });

export const createNewBreakout = (
  breakout_template_id,
  topic_id,
  cohort_id,
  time_scheduled,
  duration,
  location,
  catalyst_id,
  details,
  type = 'lecture',
  team_feedback = null,
  catalyst_notes = null,
  attendance_count = null,
  domain = null,
  catalyst_feedback = null,
) => {
  if (typeof topic_id !== 'undefined' && Array.isArray(topic_id) && topic_id.length > 0) {
    [topic_id] = topic_id;
  }
  // console.log(`${time_scheduled} ${duration} ${location}`);
  return CohortBreakout.create({
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
    type,
    team_feedback,
  });
};

export const BreakoutWithOptions = (breakoutObject) => {
  let {
    topic_id, cohort_id, breakout_template_id, time_scheduled,
    duration, location, catalyst_id, details,
    isVideoMeeting, isCodeSandbox, cohortName,
    type, team_feedback, catalyst_notes,
  } = breakoutObject;

  let time = time_scheduled;
  let currentDateTime = new Date();

  if (time_scheduled < currentDateTime) {
    isCodeSandbox = false;
    isVideoMeeting = false;
  }

  if (details.sandbox === undefined) {
    isCodeSandbox = false;
  }

  if ((time === undefined) && (duration === undefined)) {
    isVideoMeeting = false;
  }

  let zoomTopic = `Cohort ${cohortName} - Breakout \n\n Topics: \n ${details.topics} \n\n ${location}`;
  let agenda = `Cohort ${cohortName} \n\n Breakout is scheduled for the topics \n "${details.topics}" at ${time_scheduled} for ${duration} hours `;

  if (isCodeSandbox && isVideoMeeting) {
    return Promise.all([
      createSandbox(details.sandbox.template),
      createScheduledMeeting(zoomTopic, time, duration, agenda, 2, catalyst_id),
    ])
      .then(([sandbox, videoMeeting]) => {
        details.sandbox.sandbox_id = sandbox.sandbox_id;
        details.zoom = videoMeeting;
        return createNewBreakout(
          breakout_template_id, topic_id, cohort_id,
          time_scheduled, duration, location,
          catalyst_id, details, type, team_feedback, catalyst_notes,
        )
          .then(data =>
            // console.log('Breakout created with codesandbox and videoMeeting');
            data.toJSON());
      });
    // eslint-disable-next-line no-else-return
  } else if (isCodeSandbox) {
    return createSandbox(details.sandbox.template).then(sandbox_value => {
      details.sandbox.sandbox_id = sandbox_value.data.sandbox_id;
      return createNewBreakout(
        breakout_template_id, topic_id, cohort_id,
        time_scheduled, duration, location,
        catalyst_id, details, type, team_feedback, catalyst_notes,
      ).then(data =>
        // console.log('Breakout created with code sandbox only', data);
        data);
    });
  } else if (isVideoMeeting) {
    return createScheduledMeeting(zoomTopic, time, duration, agenda, 2, catalyst_id)
      .then(videoMeeting => {
        details.zoom = videoMeeting;
        return createNewBreakout(
          breakout_template_id, topic_id, cohort_id,
          time_scheduled, duration, location,
          catalyst_id, details, type, team_feedback, catalyst_notes,
        )
          .then(data =>
            // console.log('Breakout and video meeting created Created');
            data);
      });
  } else {
    return createNewBreakout(
      breakout_template_id, topic_id, cohort_id,
      time_scheduled, duration, location,
      catalyst_id, details, type, team_feedback, catalyst_notes,
    )
      .then(data =>
        // console.log('Breakout created without video meeting created Created', data);
        data);
  }
};

export const createCohortBreakouts = (
  breakoutTemplateList,
  cohort_id, codeSandbox = false, videoMeet = false,
) => Cohort.findByPk(cohort_id, {
  attributes: ['location', 'name'],
  raw: true,
})
  .then((cohort) => {
    let BreakoutObjects = breakoutTemplateList.map((breakoutTemplate) => {
      let {
        id, name, topic_id, duration, primary_catalyst, secondary_catalysts,
        breakout_schedule, details,
      } = breakoutTemplate;

      if (secondary_catalysts === null) {
        secondary_catalysts = [];
      }
      secondary_catalysts.push(primary_catalyst);
      let catalyst = secondary_catalysts[Math.floor(Math.random() * secondary_catalysts.length)];

      let breakoutObject = {
        topic_id,
        cohort_id,
        breakout_template_id: id,
        time_scheduled: breakout_schedule,
        duration,
        location: cohort.location,
        catalyst_id: catalyst,
        details,
        topic_name: name,
        isVideoMeeting: videoMeet,
        isCodeSandbox: codeSandbox,
        cohortName: cohort.name,
      };
      return breakoutObject;
    });
    return BreakoutObjects;
  })
  .then(async (breakoutsWithCohortName) => {
    let breakouts = [];
    for (let i = 0; i < breakoutsWithCohortName.length; i++) {
      let breakout = BreakoutWithOptions(breakoutsWithCohortName[i]);
      breakouts.push(breakout);
    }
    // console.log('<----- BREAKOUT OBJECT -------->', breakouts.length);
    return Promise.all(breakouts);
  })
  .catch(err => {
    console.error('Failed to location for a cohort', err);
    return null;
  });

export const getAllBreakoutsInCohort = (cohort_id) => CohortBreakout.findAll({
  where: {
    cohort_id,
  },
  raw: true,
})
  .then(allBreakouts => allBreakouts)
  .catch(err => {
    console.error('Unable to find all breakouts in the cohort', err);
    return null;
  });

export const getAllBreakoutsInCohortMilestone = (cohort_id,
  milestone_id, cohortMilestoneId) => Topic.findAll({
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
          type: {
            [Sequelize.Op.notIn]: ['reviews', 'assessment'],
          },
        },
        include: [Topic],
        raw: true,
      })
        .then(data => data)
        .catch(err => {
          console.error(err);
          return null;
        });
      return breakout;
    });
    const reviews = await CohortBreakout.findAll({
      where: {
        type: {
          [Sequelize.Op.in]: ['reviews', 'assessment'],
        },
        [Sequelize.Op.and]: Sequelize.literal(`details->>'cohort_milestone_id'='${cohortMilestoneId}'`),
      },
      include: [Topic],
      raw: true,
    })
      .then(data => data);
    breakouts = [...breakouts, ...reviews];
    return Promise.all(breakouts);
  })
  .catch(err => {
    console.error('Unable to find topics for the milestone', err);
    return null;
  });

export const createSingleBreakoutAndLearnerBreakout = (
  cohort_id,
  topic_id,
  breakout_duration,
  time_scheduled,
  agenda,
  catalyst_id,
) => createScheduledMeeting(
  topic_id,
  time_scheduled,
  breakout_duration,
  agenda,
  2,
  catalyst_id,
).then((zoomMeeting) => {
  const zoomDetails = { zoom: zoomMeeting };
  return startBreakout(topic_id,
    cohort_id, time_scheduled, zoomDetails, 'scheduled', breakout_duration)
    .then(cohortBreakout => {
      const { id } = cohortBreakout;
      return createLearnerBreakoutsForCohortMilestones(id, cohort_id)
        .then(() => ({ zoomDetails, id, cohort_id }));
    });
});

export const getLearnersForCohortBreakout = async (breakout_topic,
  cohort_id,
  cohort_breakout_id,
  breakout_status = 'scheduled',
  type = 'lecture',
) => {
  if ((breakout_status !== 'completed') && (type === 'lecture')) {
    await LearnerBreakout.destroy({
      where: {
        cohort_breakout_id,
      },
    });
    let breakoutTopic = await getTopicDataById(breakout_topic);

    const breakoutPath = breakoutTopic.path;
    let cohortLearners = await getLearnersForCohort(cohort_id);
    let userIds;
    if (breakoutPath !== 'common') {
      let pathUsers = await getUsersWithStatus(breakoutPath, cohortLearners.learners);
      userIds = pathUsers.map(eachUser => eachUser.id);
    } else {
      userIds = cohortLearners.learners;
    }
    return createAllLearnerBreakout(userIds, cohort_breakout_id);
  }
  return null;
};

export const updateZoomMeetingForBreakout = (
  id,
) => CohortBreakout.findByPk(id)
  .then(async (cohort_breakout) => {
    let meetingTime = cohort_breakout.time_scheduled;
    return createScheduledMeeting(
      cohort_breakout.topic_id,
      meetingTime,
      cohort_breakout.duration,
      '',
      2,
      cohort_breakout.catalyst_id,
    ).then(async (zoomMeeting) => {
      if (cohort_breakout.details) {
        cohort_breakout.details.zoom = zoomMeeting;
      } else {
        cohort_breakout.details = { zoom: zoomMeeting };
      }
      if (cohort_breakout.type === 'lecture') {
        // Populate Learner attendance
        await getLearnersForCohortBreakout(cohort_breakout.topic_id,
          cohort_breakout.cohort_id, id, cohort_breakout.status);

        return CohortBreakout
          .update({
            details: cohort_breakout.details,
            updated_at: Date.now(),
          }, {
            where: {
              topic_id: cohort_breakout.topic_id,
              time_scheduled: cohort_breakout.time_scheduled,
              type: 'lecture',
            },
            returning: true,
            plain: true,
          })
          .then(data => data[1]);
      }
      return CohortBreakout
        .update({
          details: cohort_breakout.details,
          updated_at: Date.now(),
        }, {
          where: {
            id,
          },
          returning: true,
          plain: true,
        })
        .then(data => data[1]);
    });
  });

export const getCohortBreakoutById = (cohort_breakout_id) => CohortBreakout.findOne({
  where: {
    id: cohort_breakout_id,
  },
  raw: true,
});

export const getCohortBreakoutsByCohortId = (cohort_id) => CohortBreakout.findAll({
  where: {
    cohort_id,
    type: 'lecture',
  },
});

export const getScheduledCohortBreakoutsByCohortId = (cohort_id) => CohortBreakout.findAll({
  where: {
    cohort_id,
    status: 'scheduled',
  },
  raw: true,
});

export const getUpcomingBreakoutsByCohortId = (cohort_id) => CohortBreakout.findAll({
  where: {
    cohort_id,
    time_scheduled: {
      [Op.gte]: new Date(),
    },
  },
  raw: true,
})
  .then(cohorts => {
    logger.info(cohorts);
    return cohorts;
  })
  .catch(err => {
    logger.error(err);
  });

export const getCalendarDetailsOfCohortBreakout = async (id) => {
  const MINUTEINMILLISECONDS = 1000 * 60;
  const cohort_breakout = await CohortBreakout.findOne({
    where: {
      id,
    },
    raw: true,
  });
  let summary;
  let description;
  // console.log(cohort_breakout);
  const {
    type, domain, breakout_template_id,
    time_scheduled, duration, location, status,
  } = cohort_breakout;
  if (type === 'lecture') {
    const breakoutTemplate = await BreakoutTemplate.findOne({
      where: { id: breakout_template_id },
      raw: true,
    });
    const { name, topic_id: topic_ids } = breakoutTemplate;

    const topics = await Promise.all(topic_ids.map(async topic_id => {
      const topic = await Topic.findOne({
        attributes: ['title'],
        where: { id: topic_id },
        raw: true,
      });
      return topic.title;
    }));
    summary = `${name.toUpperCase()} BO`;
    description = `Topics:
  ${topics.join('\n ')}
  `;
  } else {
    summary = type;
    description = type;
  }
  // convert milliseconds into minutes 360000 -> 60 minutes;
  return ({
    summary,
    start: time_scheduled,
    duration: duration / MINUTEINMILLISECONDS,
    location,
    status,
    description,
  });
};

// create or update calendar event for a catalyst.
// delete previous event if catalyst is changed.
export const updateBreakoutCalendarEventForCatalyst = async ({
  cohort_breakout, updated_time = null, catalyst_id = null,
}) => {
  const {
    id, catalyst_id: prevCatalystId, time_scheduled, details,
  } = cohort_breakout;
  let oldEventId;

  try {
    oldEventId = cohort_breakout.details.catalystCalendarEvent.id;
  } catch (e) {
    if (e instanceof TypeError) oldEventId = null;
  }
  let calendarDetails = await getCalendarDetailsOfCohortBreakout(id);
  // todo check dates using epoch time.
  const checkTime = () => (updated_time !== null) && (new Date(updated_time).getTime() !== new Date(time_scheduled).getTime());
  // check if catalyst needs to be changed
  let googleOAuthCatalyst;
  if ((catalyst_id !== null) && (catalyst_id !== prevCatalystId)) {
    // create event for that catalyst and update it in cohort_breakout details with new property
    // check if calendarEvent already created then delete old catalyst event
    // and create event for new catalyst.
    if (typeof details.catalystCalendarEvent !== 'undefined') {
      let googleOAuthPrevCatalyst = await getGoogleOauthOfUser(prevCatalystId);
      await deleteEvent(googleOAuthPrevCatalyst, oldEventId);
      // googleOAuthCatalyst = await getGoogleOauthOfUser(catalyst_id);
      // todo: create a new event for the new catalyst.
    }
    googleOAuthCatalyst = await getGoogleOauthOfUser(catalyst_id);
  }
  if ((catalyst_id === null) && (cohort_breakout.catalyst_id)) {
    googleOAuthCatalyst = await getGoogleOauthOfUser(prevCatalystId);
  }
  calendarDetails.start = checkTime() ? updated_time : time_scheduled;
  let catalystCalendarEvent;
  // if event exists update else create.
  if (oldEventId) {
    catalystCalendarEvent = await updateEvent(googleOAuthCatalyst, oldEventId, calendarDetails);
  } else {
    catalystCalendarEvent = await createEvent(googleOAuthCatalyst, calendarDetails);
  }
  return catalystCalendarEvent;
};

export const updateCohortBreakouts = ({ whereObject, updateObject }) => CohortBreakout
  .update(updateObject, { returning: true, where: whereObject })
  .then(([rowUpdated, updatedCB]) => updatedCB.map(_cb => _cb.toJSON()))
  .catch(err => {
    console.error(err);
    return 'Error updating cohort breakout';
  });

// End date inclusive, start_date excluded
export const getCohortBreakoutsBetweenDates = (
  cohort_id, start_date, end_date,
) => CohortBreakout.findAll({
  where: {
    cohort_id,
    time_scheduled: {
      [Op.and]: {
        [Op.lte]: end_date,
        [Op.gt]: start_date,
      },
    },
  },
  raw: true,
});

export const getCohortBreakoutsForTopics = async (
  topics, cohort_id,
) => CohortBreakout.findAll({
  where: {
    topic_id: {
      [Sequelize.Op.in]: topics,
    },
    cohort_id,
    type: 'lecture',
  },
});

export const createLearnerBreakoutsForMilestone = async (
  learner_ids,
  cohort_milestone_id,
  path = 'common',
) => {
  if (learner_ids && learner_ids.length > 0) {
    // Get Cohort and Milestone details
    let cohortMilestone = await getDataForMilestoneName(cohort_milestone_id);

    let milestoneTopics = await getTopicIdsByMilestone(cohortMilestone.milestone_id,
      cohortMilestone.cohort.program_id, path);
    // Get topics from milestones
    let topics = milestoneTopics.map(a => a.id);
    let milestoneBreakouts = await getCohortBreakoutsForTopics(topics,
      cohortMilestone.cohort_id);
    // Create Learner Breakouts
    let learnerBreakouts = await createAllLearnerBreakoutsForCurrentMS(learner_ids,
      milestoneBreakouts);
    return learnerBreakouts;
  }
  return null;
};

// get list of all breatkouts scheduled today for all live cohorts;
export const getTodaysCohortBreakouts = async () => {
  // todo: Need a better way to get start of the day in Asia/Kolkata timezone.
  const TODAY_START = new Date(new Date().getTime() - 10 * 60 * 60 * 1000).getTime();
  const TOMORROW_START = new Date(TODAY_START + 24 * 60 * 60 * 1000);
  const todaysBreakouts = await CohortBreakout.findAll({
    where: {
      time_scheduled: {
        [Sequelize.Op.gt]: TODAY_START,
        [Sequelize.Op.lt]: TOMORROW_START,
      },
    },
    include: [{
      model: Topic,
      attributes: ['path'],
      required: false,
    }],
    raw: true,
  });

  todaysBreakouts.map(async breakout => {
    const time = new Date(breakout.time_scheduled).toLocaleTimeString([], {
      timeZone: 'Asia/Kolkata', hour12: true, hour: '2-digit', minute: '2-digit',
    });
    try {
      breakout.topics = breakout.details.topics.replace(/\n(?!$)/g, ', ');
      breakout.topics = breakout.topics.replace(/\n/, '');
      if (breakout.type === 'assessment') {
        const learnerSlackId = await getSlackIdForLearner(breakout.details.learner_id);
        breakout.topics = `Assessment for <@${learnerSlackId}>`;
      }
    } catch (err) {
      breakout.topics = await getTopicNameById(breakout.topic_id);
    }
    let path = (breakout['topic.path'] === 'common') ? '' : `[${breakout['topic.path']}]`;
    breakout.topics = `${breakout.topics}${path} at *${time}* \n`;
    return breakout;
  });
  const breakouts = _.groupBy(todaysBreakouts, b => b.cohort_id);
  // eslint-disable-next-line no-restricted-syntax
  for (let cohort_id in breakouts) {
    if (Object.prototype.hasOwnProperty.call(breakouts, cohort_id)) {
      breakouts[cohort_id] = _.groupBy(breakouts[cohort_id], iter => iter.type);
    }
  }
  return breakouts;
};

export const updateOneCohortBreakouts = async (details, cohort_breakout) => {
  let whereObject = {};
  if (cohort_breakout.type === 'lecture') {
    whereObject = {
      topic_id: cohort_breakout.topic_id,
      time_scheduled: cohort_breakout.time_scheduled,
      type: 'lecture',
    };
  } else {
    let { id } = cohort_breakout;
    whereObject = { id };
  }
  return updateCohortBreakouts({
    updateObject: {
      details,
    },
    whereObject,
  });
};

export const updateSanboxUrl = async (id, sandbox_id, sandbox_url) => {
  let breakout = await findOneCohortBreakout({ id });

  let breakoutDetails = breakout.details;
  breakoutDetails.sandbox = { sandbox_id, sandbox_url };
  return updateOneCohortBreakouts(breakoutDetails, id);
};

export default CohortBreakout;
