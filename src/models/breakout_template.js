import Sequelize from 'sequelize';
import uuid from 'uuid/v4';
import db from '../database';
import { Topic } from './topic';
import { CohortMilestone } from './cohort_milestone';

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
    )
    .catch(err => {
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

export const createBreakoutsInMilestone = (cohort_id) => {
  BreakoutTemplate.findAll({
    attributes: ['id', 'topic_id', 'duration', 'time_scheduled', 'after_days'],
    raw: true,
  })
    .then(breakoutTemplates => {
      console.log('BreakoutTemplates: ', breakoutTemplates);
      breakoutTemplates = breakoutTemplates.map((breakoutTemplate) => {
        getReleaseTimeFromTopic(breakoutTemplate.topic_id[0], cohort_id)
          .then(extra => {
            console.log('extra data :', extra);
            let postBreakoutTemplate = { ...breakoutTemplate, ...extra };
            return postBreakoutTemplate;
          })
          .catch(err => {
            console.log('Failed to get Release time and cohort_milestone_id.', err);
            return null;
          });
      });
      return breakoutTemplates
    })
    .then(postBreakoutTemplates => {
      console.log('----MAIN SCHEDULING ------');
      console.log(postBreakoutTemplates);
      return postBreakoutTemplates;
      // return postBreakoutTemplates
      //   .then(data => {
      //     console.log('DATA: ', data);
      //     return data;
      //   })
      //   .catch(err => {
      //     console.error('Failed at 2: ', err);
      //     return null;
      //   });

      // here we create cohort_breakout using
    })
    .catch(err => {
      console.error(err);
      return null;
    });
};
