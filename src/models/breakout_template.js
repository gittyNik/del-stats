import Sequelize from 'sequelize';
import uuid from 'uuid/v4';
import db from '../database';
import { getTopicById } from './topic';
import { getMilestoneStartDate } from './cohort_milestone';

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
});

export const getReleaseTimeFromTopic = (topic_id, cohort_id) => 
    getTopicById(topic_id)
    .then(topic => 
        getMilestoneStartDate(cohort_id, topic.milestone_id)
        .then(
            cohortMilestone => {
                return {
                cohort_milestone_id: cohortMilestone.id,
                release_time: cohortMilestone.release_time,
            }
        }).catch(err => {
          console.error(`Failed to find Cohort Milestone for the topic: ${topic}`);
          console.error(err);
          return null;
        })
    ).catch(err => {
      console.error(`Failed to find topic for ${topic_id}`);
      console.error(err);
      return null;
    });;

export const updateBreakoutTemplates = (breakoutTemplates, cohort_id) => {
  breakoutTemplates.map((breakoutTemplate) => {
    console.log('Unpack breakoutTemplate: ');
    getReleaseTimeFromTopic(breakoutTemplate.topic_id[0], cohort_id)
      .then(extra => {
        let updatedItem = { ...breakoutTemplate, ...extra };
        console.log('updated Item: ');
        return updatedItem;
      })
      .catch(err => {
        console.error('Error in updating BreakoutTemplates', err);
        return null;
      });
  });
};

export const createBreakoutsInMilestone = (cohort_id) => 
  BreakoutTemplate.findAll({
    attributes: ['id', 'topic_id', 'duration', 'time_scheduled', 'after_days'],
    raw: true,
  })
    .then(async breakoutTemplates => {
      const updatedBreakoutTemplates = breakoutTemplates.map(async breakoutTemplate => {
         const fetchbreakouts = await getReleaseTimeFromTopic(breakoutTemplate.topic_id[0], cohort_id)
          .then(extra => {
            console.log('extra data :', extra);
            const postBreakoutTemplate = { ...breakoutTemplate, ...extra };
            return postBreakoutTemplate;
          })
          .catch(err => {
            console.log('Failed to get Release time and cohort_milestone_id.', err);
            return null;
          });
          return fetchbreakouts;
      });
      const breakoutTemplatePromises = await Promise.all(updatedBreakoutTemplates);
      return breakoutTemplatePromises;
});
