import Sequelize from 'sequelize';
import { v4 as uuid } from 'uuid';
import cache from '../cache';
import db from '../database';
import { Topic } from './topic';
import { User } from './user';
import { CohortMilestone } from './cohort_milestone';
import { createCohortBreakouts } from './cohort_breakout';
import { createLearnerBreakoutsForCohortMilestones } from './learner_breakout';
import { Milestone } from './milestone';
import { calculateBreakoutTime } from '../util/date-handlers';
import logger from '../util/logger';

export const BREAKOUT_LEVEL = ['beginner', 'intermediate', 'advanced'];

const TEMPLATE_STATUS = [
  'active',
  'inactive',
];

const TEMPLATE_TYPE = [
  'recurring',
  'scheduled',
  'independent',
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
  updated_by_user: Sequelize.ARRAY(Sequelize.JSON),
  cohort_duration: Sequelize.INTEGER,
  program_id: {
    type: Sequelize.UUID,
    references: { model: 'programs' },
  },
  status: {
    type: Sequelize.ENUM(...TEMPLATE_STATUS),
    defaultValue: 'active',
  },
  type: {
    type: Sequelize.ENUM(...TEMPLATE_TYPE),
    defaultValue: 'scheduled',
  },
  catalyst_breakout: {
    type: Sequelize.BOOLEAN,
    defaultValue: false,
  },
  assign_primary_catalyst: {
    type: Sequelize.BOOLEAN,
    defaultValue: false,
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
      logger.error(`Failed to find Cohort Milestone for the topic: ${topic}`);
      logger.error(err);
      return null;
    }))
  .catch(err => {
    logger.error(`Failed to find topic for ${topic_id}`);
    logger.error(err);
    return null;
  });

export const updateBreakoutTemplates = (breakoutTemplates, cohort_id) => Promise.all(
  breakoutTemplates.map(async (breakoutTemplate) => {
    try {
      let extra = await getReleaseTimeFromTopic(breakoutTemplate.topic_id[0], cohort_id);
      return { ...breakoutTemplate, ...extra };
    } catch (err) {
      logger.error('error in update Breakout Template', err);
      return null;
    }
  }),
);

export const scheduling = (updatedBreakout) => Promise.all(
  updatedBreakout.map(async (eachBreakout) => {
    try {
      let updateBreakout = await calculateBreakoutTime(eachBreakout);
      return { ...eachBreakout, ...updateBreakout };
    } catch (err) {
      logger.error('error in calculating Breakout Time', err);
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
  logger.debug(`Total Learner Breakouts created for cohort_id: ${cohort_id} is ${allLearnerBreakouts.length}`);
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
  let allBreakoutTemplates;
  const cachedTemplates = await cache.get('BREAKOUT_TEMPLATES');
  if (cachedTemplates === null) {
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
    let catalystMenonization = {};
    let topicMenonization = {};
    allBreakoutTemplates = await Promise.all(breakoutTemplates.map(async eachTemplate => {
      let topicsData = await Promise.all(eachTemplate.topic_id.map(
        eachTopic => {
          // Avoiding duplicate api calls
          if (eachTopic in topicMenonization) {
            return Promise.resolve(topicMenonization[eachTopic]);
          }
          return Topic.findByPk(eachTopic, {
            attributes: ['title', 'path', 'optional'],
            include: [{
              model: Milestone,
              attributes: ['name', 'alias', 'id'],
            }],
            raw: true,
          });
        },
      ));
      if (eachTemplate.secondary_catalysts !== null) {
        let secondaryCatalyst = await Promise.all(eachTemplate.secondary_catalysts.map(
          catalyst_id => {
            // Avoiding duplicate api calls
            if (catalyst_id in catalystMenonization) {
              return Promise.resolve(catalystMenonization[catalyst_id]);
            }
            return User.findOne(
              {
                where: {
                  id: catalyst_id,
                },
                attributes: ['name'],
                raw: true,
              },
            );
          },
        ));
        eachTemplate.secondaryCatalyst = secondaryCatalyst.map(eachCatalyst => {
          catalystMenonization[eachCatalyst.id] = eachCatalyst;
          return eachCatalyst.name;
        });
      } else {
        eachTemplate.secondaryCatalyst = [];
      }
      eachTemplate.topicNames = topicsData.map(eachTopic => eachTopic.title);
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
    await cache.set('BREAKOUT_TEMPLATES', JSON.stringify(allBreakoutTemplates), 'EX', 604800);
  } else {
    allBreakoutTemplates = JSON.parse(cachedTemplates);
  }
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

export const createBreakoutTemplate = async ({
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
  user,
  status,
  catalyst_breakout,
  assign_primary_catalyst,
}) => {
  try {
    await cache.del('BREAKOUT_TEMPLATES');
  } catch (err) {
    logger.warn('Cannot find key in Redis');
  }
  return BreakoutTemplate.create(
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
      updated_by: [{
        user_id: user.id,
        name: user.name,
        date: new Date(),
      }],
      status,
      catalyst_breakout,
      assign_primary_catalyst,
    },
  );
};

export const updateBreakoutTemplate = ({
  id,
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
  user,
  cohort_duration,
  program_id,
  status,
  catalyst_breakout,
  assign_primary_catalyst,
}) => BreakoutTemplate.findOne({
  where: {
    id,
  },
})
  .then(async (milestone) => {
    try {
      await cache.del('BREAKOUT_TEMPLATES');
    } catch (err) {
      logger.warn('Cannot find key in Redis');
    }

    let updated_by = milestone.updated_by_user;
    if (updated_by) {
      let user_details = {
        user_id: user.id,
        name: user.name,
        date: new Date(),
      };
      updated_by.push(user_details);
    } else {
      updated_by = [{
        user_id: user.id,
        name: user.name,
        date: new Date(),
      }];
    }
    return BreakoutTemplate.update({
      updated_by_user: updated_by,
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
      catalyst_breakout,
      assign_primary_catalyst,
    }, {
      where: {
        id,
      },
      returning: true,
    });
  });

export const deleteBreakoutTemplate = async (id) => {
  try {
    await cache.del('BREAKOUT_TEMPLATES');
  } catch (err) {
    logger.warn('Cannot find key in Redis');
  }
  return BreakoutTemplate.destroy(
    { where: { id } },
  );
};
