import Sequelize from 'sequelize';
import uuid from 'uuid/v4';
import db from '../database';
import { Topic, getTopicById } from './topic';
import { CohortMilestone, getMilestoneStartDate } from './cohort_milestone';
import { createCohortBreakouts } from './cohort_breakout';

export const BREAKOUT_LEVEL = ['beginner', 'intermediate', 'advanced'];

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
});

export const getReleaseTimeFromTopic = (topic_id, cohort_id) =>
  Topic.findByPk(topic_id, {
    attributes: ['milestone_id'],
    raw: true,
  })
    .then(topic =>
      CohortMilestone.findOne({
        attributes: ['id', 'release_time'],
        where: {
          cohort_id,
          milestone_id: topic.milestone_id,
        },
        raw: true,
      })
        .then(cohortMilestone => {
          return {
            cohort_milestone_id: cohortMilestone.id,
            release_time: cohortMilestone.release_time,
          }
        })
        .catch(err => {
          console.error(`Failed to find Cohort Milestone for the topic: ${topic}`);
          console.error(err);
          return null;
        })
    ).catch(err => {
      console.error(`Failed to find topic for ${topic_id}`);
      console.error(err);
      return null;
    });

export const updateBreakoutTemplates = (breakoutTemplates, cohort_id) => {
  return Promise.all(breakoutTemplates.map(async (breakoutTemplate) => {
    console.log('Unpack breakoutTemplate: ');
    try {
      let extra = await getReleaseTimeFromTopic(breakoutTemplate.topic_id[0], cohort_id);
      console.log('extra:', extra);
      return { ...breakoutTemplate, ...extra };
    } catch (err) {
      console.log('error in update Breakout Template', err);
      return null;
    }
  }));
};

export const calculateBreakoutTime = (eachBreakoutTemp) => {
  // Shallow copy datetime object
  const RELEASE_TIME = new Date(eachBreakoutTemp.release_time.valueOf());
  const { duration, time_scheduled, after_days } = eachBreakoutTemp;
  let breakoutScheduledTime = RELEASE_TIME;
  breakoutScheduledTime.setDate(RELEASE_TIME.getDate() + after_days);
  let time_split = time_scheduled.split(":")
  console.log('After adding days: ', breakoutScheduledTime);
  breakoutScheduledTime.setHours(time_split[0], time_split[1], time_split[2]);
  console.log('Breakout time: ', breakoutScheduledTime);
  let breakoutSchedule = { 'breakout_schedule': breakoutScheduledTime };
  return { ...eachBreakoutTemp, ...breakoutSchedule };
};

export const scheduling = (updatedBreakout) => {
  return Promise.all(updatedBreakout.map(async (eachBreakout) => {
    try {
      let updateBreakout = await calculateBreakoutTime(eachBreakout);
      return updateBreakout;
    } catch (err) {
      console.log('error in calculating Breakout Time', err);
      return null;
    }
  }));
};


export const createBreakoutsInMilestone = (cohort_id, program_id, cohort_duration) => BreakoutTemplate
  .findAll({
    attributes: ['id', 'name', 'topic_id', 'details', 'duration', 'time_scheduled', 'after_days', 'primary_catalyst', 'level'],
    where: { program_id, cohort_duration },
    raw: true,
  })
  .then(breakoutTemplates => updateBreakoutTemplates(breakoutTemplates, cohort_id))
  .then(updatedBreakoutTemplates => scheduling(updatedBreakoutTemplates))
  .then(breakoutTemplates => createCohortBreakouts(breakoutTemplates, cohort_id))
  .then(createdBreakouts => {
    console.log('Breakouts created for Cohort');
    //return (createdBreakouts);
  })
  .catch(err => {
    console.error(err);
    //return null;
  });
