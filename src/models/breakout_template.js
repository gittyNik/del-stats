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

export const getReleaseTimeFromTopic = async (topic_id, cohort_id) => {
  return Topic.findByPk(topic_id, {
    attributes: ['milestone_id'],
    raw: true,
  })
    .then(topic => {
      return CohortMilestone.findOne({
        attributes: ['id', 'release_time'],
        where: {
          cohort_id,
          milestone_id: topic.milestone_id,
        },
        raw: true,
      })
        .then(cohortMilestone => {
          // console.log('<------Cohort_milestone---->');
          console.log('Cohort Milestone: ', cohortMilestone);
          return {
            cohort_milestone_id: cohortMilestone.id,
            release_time: cohortMilestone.release_time,
          };
        })
        .catch(err => {
          console.error(`Failed to find Cohort Milestone for the topic: ${topic}`);
          console.error(err);
          return null;
        });
    })
    .catch(err => {
      console.error(`Failed to find topic for ${topic_id}`);
      console.error(err);
      return null;
    });
};

export const createBreakoutsInMilestone = (cohort_id, cohort_milestones) => {
  return BreakoutTemplate.findAll({
    attributes: ['id', 'topic_id', 'duration', 'time_scheduled', 'after_days'],
    raw: true,
  })
    .then(async (breakoutTemplates) => {
      console.log('<------BreakoutTemplate ------->');
      console.log(breakoutTemplates);

      let breakoutTemplateWithReleasetime = await breakoutTemplates.map(async (breakoutTemplate) => {
        try {
          let { cohort_milestone_id, release_time } = await getReleaseTimeFromTopic(breakoutTemplate.topic_id[0], cohort_id);
          breakoutTemplate.cohort_milestone = cohort_milestone_id;
          breakoutTemplate.releaseTime = release_time;
          return breakoutTemplate;
        } catch (err) {
          console.error(err);
          return null;
        }
      });
      console.log('<-------- Breakout Template with release time and cohort_milestone ---------->');
      console.log(breakoutTemplateWithReleasetime);

      let scheduledMilestones = breakoutTemplateWithReleasetime.map(data => {
        // here the actual scheduling happens.
        // breakoutTemplateWithReleasetime = {id, [topic_id], release_time, cohort_milestone_id }
        // create cohort_breakout only for the topic in breakout_template.

        //  const DAY = 86400000
        // const MINUTE = 60000
        // console.log('<------ CORE -------->');
        // console.log(data);
        return data;
      });

      console.log('<-----CORE: SCHEDULED MILESTONES ----->');
      console.log(scheduledMilestones);
    })
    .catch(err => {
      console.error(err);
      return null;
    });
};

// getReleaseTimeFromTopic('80dc8b76-03ca-4f4a-a255-5ded6d3f6c66', 'bb504186-a435-4548-a171-ec89daaebb00');
