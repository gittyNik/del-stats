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
  // topic_id -> Topic(id) -> milestone_id,
  // milestone_id ->look in the CohortMilestone where milestone_id ==id -> release_time.
  let milestone_id;
  try {
    milestone_id = await Topic.findByPk(topic_id, {
      attributes: ['milestone_id'],
    });
  } catch (e) {
    console.log(e);
    return null;
  }
  console.log(milestone_id);
  return milestone_id;

  // let release_time = await CohortMilestone.findOne({
  //   attributes: ['id', 'release_time'],
  //   where: {
  //     cohort_id,
  //     milestone_id,
  //   },
  // });
  // console.log(release_time);
  // return release_time;
};

export const createBreakoutsInMilestone = (cohort_id, cohort_milestones) => {
  BreakoutTemplate.findAll({
    attributes: ['id', 'topic_id'],
    raw: true,
  }).then(breakoutTemplates => {
    console.log('<------BreakoutTemplate ------->');
    console.log(breakoutTemplates);
    let releaseTimeWithCohortMilestone = breakoutTemplates.map(breakoutTemplate => {
      return getReleaseTimeFromTopic(breakoutTemplate.topic_id, cohort_id);
    });
    console.log(releaseTimeWithCohortMilestone);
    let scheduledMilestones = releaseTimeWithCohortMilestone.map(data => {
      let { release_time, cohort_milestone_id } = data;
      //
      console.log(data);
    })
  });
};

// getReleaseTimeFromTopic('80dc8b76-03ca-4f4a-a255-5ded6d3f6c66', 'bb504186-a435-4548-a171-ec89daaebb00');
