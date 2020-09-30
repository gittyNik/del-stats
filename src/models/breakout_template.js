import Sequelize from 'sequelize';
import uuid from 'uuid/v4';
import db from '../database';
import { Topic } from './topic';
import { User } from './user';
import { CohortMilestone } from './cohort_milestone';
import { createCohortBreakouts } from './cohort_breakout';
import { createLearnerBreakoutsForCohortMilestones } from './learner_breakout';
import { Milestone } from './milestone';

export const BREAKOUT_LEVEL = ['beginner', 'intermediate', 'advanced'];

const TEMPLATE_STATUS = [
  'active',
  'inactive',
];

export const BreakoutTemplate = db.define('breakout_templates', {
  id: {
    type: Sequelize.UUID,
    primaryKey: true,
  },
  name: {
    type: Sequelize.STRING,
    allowNull: true,
  },
  topic_id: {
    type: Sequelize.ARRAY(
      {
        type: Sequelize.UUID,
        references: { model: 'topics' },
      },
    ),
    allowNull: false,
  },
  mandatory: {
    type: Sequelize.BOOLEAN,
    defaultValue: false,
  },
  level: Sequelize.ENUM(...BREAKOUT_LEVEL),
  primary_catalyst: {
    type: Sequelize.UUID,
    references: { model: 'users' },
    allowNull: false,
  },
  secondary_catalysts: {
    type: Sequelize.ARRAY({
      type: Sequelize.UUID,
      references: { model: 'users' },
      allowNull: true,
    }),
  },
  // Will have sandbox url,
  // {'sandbox': {'template': {}}, 'zoom': {}}
  details: Sequelize.JSON,
  duration: {
    type: Sequelize.INTEGER,
    defaultValue: 30,
  },
  time_scheduled: {
    type: Sequelize.TIME,
    allowNull: false,
  },
  after_days: {
    type: Sequelize.INTEGER,
    allowNull: false,
  },
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
  updated_by: {
    type: Sequelize.ARRAY(
      {
        type: Sequelize.UUID,
        references: { model: 'users' },
      },
    ),
    allowNull: true,
  },
  cohort_duration: Sequelize.INTEGER,
  program_id: {
    type: Sequelize.UUID,
    references: { model: 'programs' },
  },
  status: {
    type: Sequelize.ENUM(...TEMPLATE_STATUS),
    defaultValue: 'active',
  },
});

export const getReleaseTimeFromTopic = (topic_id, cohort_id) => Topic.findByPk(topic_id, {
  attributes: ['milestone_id'],
  raw: true,
})
  .then(topic => CohortMilestone.findOne({
    attributes: ['id', 'release_time'],
    where: {
      cohort_id,
      milestone_id: topic.milestone_id,
    },
    raw: true,
  })
    .then(cohortMilestone => ({
      cohort_milestone_id: cohortMilestone.id,
      release_time: cohortMilestone.release_time,
    }))
    .catch(err => {
      console.error(`Failed to find Cohort Milestone for the topic: ${topic}`);
      console.error(err);
      return null;
    }))
  .catch(err => {
    console.error(`Failed to find topic for ${topic_id}`);
    console.error(err);
    return null;
  });

export const updateBreakoutTemplates = (breakoutTemplates, cohort_id) => Promise.all(
  breakoutTemplates.map(async (breakoutTemplate) => {
    try {
      let extra = await getReleaseTimeFromTopic(breakoutTemplate.topic_id[0], cohort_id);
      return { ...breakoutTemplate, ...extra };
    } catch (err) {
      console.error('error in update Breakout Template', err);
      return null;
    }
  }),
);

export const changeTimezone = (date, ianatz) => {
  // suppose the date is 02:30 UTC
  let invdate = new Date(date.toLocaleString('en-US', {
    timeZone: ianatz,
  }));

  // then invdate will be 08:00pm in India
  // and the diff is 5:30 hours
  let diff = date.getTime() - invdate.getTime();

  // so 08:00pm in India is 02:30 UTC
  return new Date(date.getTime() + diff);
};

export const calculateBreakoutTime = (eachBreakoutTemp) => {
  // Shallow copy datetime object
  const RELEASE_TIME = new Date(eachBreakoutTemp.release_time.toLocaleString('en-US', { timeZone: 'Asia/Kolkata' }));
  const { duration, time_scheduled, after_days } = eachBreakoutTemp;
  let breakoutScheduledTime = RELEASE_TIME;
  let time_split = time_scheduled.split(':');

  breakoutScheduledTime.setDate(RELEASE_TIME.getDate() + after_days);
  // console.log('After adding days: ', breakoutScheduledTime);
  breakoutScheduledTime.setHours(time_split[0], time_split[1], time_split[2]);
  // console.log('Breakout time: ', breakoutScheduledTime);

  let breakoutScheduledUTC = changeTimezone(breakoutScheduledTime, 'Asia/Kolkata');
  let breakoutSchedule = { breakout_schedule: breakoutScheduledUTC };
  return { ...eachBreakoutTemp, ...breakoutSchedule };
};

export const scheduling = (updatedBreakout) => Promise.all(
  updatedBreakout.map(async (eachBreakout) => {
    try {
      let updateBreakout = await calculateBreakoutTime(eachBreakout);
      return updateBreakout;
    } catch (err) {
      console.error('error in calculating Breakout Time', err);
      return null;
    }
  }),
);

const createLearnerBreakouts = async (cohortBreakouts, cohort_id) => {
  // Create Learner breakouts based on Cohort Milestone breakouts
  let learnerBreakouts = [];
  for (let i = 0; i < cohortBreakouts.length; i++) {
    let breakout = createLearnerBreakoutsForCohortMilestones(cohortBreakouts[i].id, cohort_id);
    learnerBreakouts.push(breakout);
  }
  let allLearnerBreakouts = Promise.all(learnerBreakouts);
  console.debug(`Total Learner Breakouts created for cohort_id: ${cohort_id} is ${allLearnerBreakouts.length}`);
  return allLearnerBreakouts;
};

export const createBreakoutsInMilestone = (
  cohort_id, program_id,
  cohort_duration,
) => BreakoutTemplate
  .findAll({
    attributes: ['id', 'name', 'topic_id', 'details',
      'duration', 'time_scheduled', 'after_days',
      'primary_catalyst', 'level', 'secondary_catalysts'],
    where: { program_id, cohort_duration, status: 'active' },
    raw: true,
  })
  .then(breakoutTemplates => updateBreakoutTemplates(breakoutTemplates, cohort_id))
  .then(updatedBreakoutTemplates => scheduling(updatedBreakoutTemplates))
  .then(breakoutTemplates => createCohortBreakouts(breakoutTemplates, cohort_id))
  .then(createdBreakouts => createLearnerBreakouts(createdBreakouts, cohort_id));

// Create Breakouts of Specific type
export const createTypeBreakoutsInMilestone = (cohort_id, program_id,
  cohort_duration, type, codeSandBox = false, videoMeet = false) => BreakoutTemplate.findAll(
  {
    attributes: ['id', 'name', 'topic_id', 'details',
      'duration', 'time_scheduled', 'after_days',
      'primary_catalyst', 'level', 'secondary_catalysts'],
    where: {
      program_id,
      cohort_duration,
      [Sequelize.Op.and]: Sequelize.literal(`details->>'type'='${type}'`),
      status: 'active',
    },
    raw: true,
  },
).then(breakoutTemplates => updateBreakoutTemplates(breakoutTemplates, cohort_id))
  .then(updatedBreakoutTemplates => scheduling(updatedBreakoutTemplates))
  .then(breakoutTemplates => createCohortBreakouts(breakoutTemplates,
    cohort_id, codeSandBox, videoMeet));

export const getAllBreakoutTemplates = async () => {
  let breakoutTemplates = await BreakoutTemplate.findAll({
    where: {
      status: 'active',
    },
    include: [
      {
        model: User,
        attributes: ['name'],
      },
    ],
    raw: true,
  });
  let allBreakoutTemplates = await Promise.all(breakoutTemplates.map(async eachTemplate => {
    let topicsData = await Promise.all(eachTemplate.topic_id.map(
      eachTopic => Topic.findByPk(eachTopic, {
        attributes: ['title', 'path', 'optional'],
        include: [{
          model: Milestone,
          attributes: ['name', 'alias'],
        }],
        raw: true,
      }),
    ));
    eachTemplate.topics = topicsData;
    let cohortDuration;
    if (eachTemplate.cohort_duration === 16) {
      cohortDuration = 'Full-time';
    } else {
      cohortDuration = 'Part-time';
    }
    eachTemplate.duration /= 60000;
    eachTemplate.cohortDuration = cohortDuration;
    return eachTemplate;
  }));
  return allBreakoutTemplates;
};

export const getAllBreakoutTemplatesByProgram = (program_id,
  cohort_duration) => BreakoutTemplate.findAll({
  where: {
    program_id,
    cohort_duration,
    status: 'active',
  },
  raw: true,
});

export const getBreakoutTemplateById = id => BreakoutTemplate.findByPk(id);

export const createBreakoutTemplate = (
  name, topic_id,
  mandatory,
  level,
  primary_catalyst,
  secondary_catalysts,
  details,
  duration,
  time_scheduled,
  after_days,
  cohort_duration,
  program_id,
  user_id,
  status,
) => BreakoutTemplate.create(
  {
    id: uuid(),
    name,
    topic_id,
    mandatory,
    level,
    primary_catalyst,
    secondary_catalysts,
    details,
    duration,
    time_scheduled,
    after_days,
    cohort_duration,
    program_id,
    updated_by: [user_id],
    status,
  },
);

export const updateBreakoutTemplate = (id,
  name,
  topic_id,
  mandatory,
  level,
  primary_catalyst,
  secondary_catalysts,
  details,
  duration,
  time_scheduled,
  after_days,
  user_id,
  cohort_duration,
  program_id,
  status) => BreakoutTemplate.findOne({
  where: {
    id,
  },
})
  .then((milestone) => {
    milestone.updated_by.push(user_id);
    milestone.update({
      updated_by: milestone.updated_by,
      name,
      topic_id,
      mandatory,
      level,
      primary_catalyst,
      secondary_catalysts,
      details,
      duration,
      time_scheduled,
      after_days,
      cohort_duration,
      program_id,
      status,
    }, {
      where: {
        id,
      },
    });
  });

export const deleteBreakoutTemplate = (id) => BreakoutTemplate.destroy(
  { where: { id } },
);
