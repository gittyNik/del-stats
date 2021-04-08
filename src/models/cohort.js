import Sequelize from 'sequelize';
// import { Program } from './program';
import _ from 'lodash';
import { Application, updateCohortJoining } from './application';
import {
  User, USER_ROLES, changeUserRole, addUserStatus,
  removeUserStatus,
} from './user';
import db from '../database';
import {
  createCohortMilestones, CohortMilestone,
  getLiveCohortMilestone,
} from './cohort_milestone';
import { getCohortBreakoutsBetweenDates } from './cohort_breakout';
// import { BreakoutTemplate, CreateBreakoutsInMilestone } from './breakout_template';
import { createTypeBreakoutsInMilestone } from './breakout_template';
import {
  removeLearnerFromTeam,
} from '../controllers/operations/learners.controller';
import {
  removeLearnerBreakouts,
  createLearnerBreakouts,
} from './learner_breakout';
import {
  moveLearnerToNewGithubTeam,
  addLearnerToGithubTeam,
} from '../integrations/github/controllers';
import {
  removeLearnerFromSlackChannel,
  moveLearnerToNewSlackChannel, addLearnersToCohortChannel,
} from './slack_channels';
import { removeLearnerFromGithubTeam } from '../integrations/github/controllers/teams.controller';
import logger from '../util/logger';
import { sendMessageToSlackChannel } from '../integrations/slack/team-app/controllers/milestone.controller';

export const COHORT_STATUS = [
  'upcoming',
  'live',
  'completed',
  'deferred',
  'reallocated',
  'suitup',
  'filled',
  'fast-filling',
];

const COHORT_TYPE = [
  'hybrid',
  'remote',
];

export const Cohort = db.define('cohorts', {
  id: {
    type: Sequelize.UUID,
    primaryKey: true,
  },
  status: {
    type: Sequelize.ENUM(...COHORT_STATUS),
    defaultValue: 'upcoming',
  },
  type: {
    type: Sequelize.ENUM(...COHORT_TYPE),
    defaultValue: 'upcoming',
  },
  name: Sequelize.STRING,
  location: Sequelize.STRING,
  learners: Sequelize.ARRAY(Sequelize.UUID),
  program_id: {
    type: Sequelize.STRING,
    references: { model: 'programs', key: 'id' },
  },
  start_date: Sequelize.DATE,
  learning_ops_manager: {
    type: Sequelize.UUID,
    references: { model: 'users', key: 'id' },
  },
  duration: Sequelize.INTEGER,

});

export const getLearnerCohort = learner_id => Cohort.findOne({
  where: {
    learners: { [Sequelize.Op.contains]: [learner_id] },
  },
  raw: true,
});

export const updateCohortById = async ({
  id,
  location,
  program,
  start_date,
  status,
  name,
  duration,
  type,
  updated_by_id,
  updated_by_name,
}) => {
  try {
    if (status !== null) {
      const message = `${program} Cohort: *${name}* ${location} has been marked: *${status}* by ${updated_by_name}`;
      const context = 'Cohort status update';
      sendMessageToSlackChannel(message, context, process.env.SLACK_LEARNER_AFFAIRS);
    }
  } catch (err) {
    console.warn('Failed to send slack message');
  }
  return Cohort.update({
    location,
    program_id: program,
    start_date,
    status,
    name,
    duration,
    type,
  }, {
    where: { id },
    returning: true,
  });
};

export const findAllCohorts = (
  where, attributes, include, order,
) => Cohort.findAll({
  where,
  include,
  order,
  attributes,
});

export const findOneCohort = (
  where, attributes, include, order,
) => Cohort.findAll({
  where,
  include,
  order,
  attributes,
});

export const getCohortsStartingToday = () => {
  const today = new Date();
  const tonight = new Date();

  today.setHours(0);
  today.setMinutes(0);
  today.setSeconds(0);

  tonight.setHours(23);
  tonight.setMinutes(59);
  tonight.setSeconds(59);

  return Cohort.findAll({
    where: {
      start_date: { $between: [today, tonight] },
    },
  });
};

export const getLearnersForCohort = cohort_id => Cohort.findOne({
  where: {
    id: cohort_id,
  },
  attributes: ['learners'],
  raw: true,
});

export const getLiveCohorts = () => Cohort.findAll({
  where: {
    learners: Sequelize.literal('learners<>\'{}\''),
    status: 'live',
  },
  order: [['start_date', 'DESC']],
  raw: true,
});

export const getFutureCohorts = () => {
  const tonight = new Date();

  tonight.setHours(23);
  tonight.setMinutes(59);
  tonight.setSeconds(59);

  return Cohort.findAll({
    where: {
      start_date: { [Sequelize.Op.gt]: tonight },
    },
  });
};

export const addLearnerPaths = (learners) => learners.map(learner => {
  if (learner.status) {
    if (learner.status.indexOf('frontend') > -1) {
      learner.path = 'Frontend';
    } else if (learner.status.indexOf('backend') > -1) {
      learner.path = 'Backend';
    } else {
      learner.path = 'N/A';
    }
  }
  return learner;
});

const populateCohortsWithLearners = (cohorts) => {
  const learnerGetters = cohorts.map((cohort) => User.findAll({
    where: {
      id: { [Sequelize.Op.in]: cohort.learners },
    },
    attributes: { exclude: ['profile'] },
    raw: true,
  }).then((learners) => {
    let updatedLearners = addLearnerPaths(learners);
    cohort.learnerDetails = updatedLearners;
    return cohort;
  }));
  return Promise.all(learnerGetters);
};

export const getLearnersFromCohorts = (ids) => Cohort.findAll({
  where: {
    id: {
      [Sequelize.Op.in]: ids,
    },
  },
  attributes: ['learners', 'name', 'id', 'duration', 'location'],
});

// TODO: Optimize this later
export const getCohortLearnerDetailsByName = ({ name, location, year }) => {
  const yearStart = new Date(new Date(0).setFullYear(year));
  const yearEnd = new Date(new Date(0).setFullYear(year + 1) - 1);

  return Cohort.findAll({
    where: {
      name,
      location,
      start_date: { [Sequelize.Op.between]: [yearStart, yearEnd] },
    },
    raw: true,
  }).then(populateCohortsWithLearners);
};

export const getCohortLearnerDetails = (id) => Cohort.findByPk(
  id, { raw: true },
).then((cohort) => populateCohortsWithLearners([cohort]));

export const getLearnerDetailsForCohorts = (ids) => Cohort.findAll({
  where: {
    id: ids,
  },
  attributes: ['learners'],
}).then((cohorts) => populateCohortsWithLearners(cohorts));

// TODO: change this to cohort_joined later
export const updateCohortLearners = (id) => Application.findAll({
  where: { cohort_joining: id, status: 'joined' },
}).then((applications) => {
  const learners = applications.map((a) => a.user_id);
  return db
    .transaction((transaction) => Promise.all([
      Cohort.update(
        { learners },
        {
          where: { id },
          returning: true,
          raw: true,
          transaction,
        },
      ).then((rows) => rows[1][0]),
      Application.update(
        { status: 'archieved' },
        {
          where: {
            user_id: { [Sequelize.Op.in]: learners },
          },
          transaction,
        },
      ),
      User.update(
        { role: USER_ROLES.LEARNER },
        {
          where: {
            id: { [Sequelize.Op.in]: learners },
          },
          transaction,
        },
      ),
    ]))
    .then(([cohort]) => cohort);
});

export const beginCohortWithId = (cohort_id) => Promise.all([
  updateCohortLearners(cohort_id),
  createCohortMilestones(cohort_id),
])
  .then(([cohort, milestones]) => {
    createTypeBreakoutsInMilestone(
      cohort_id,
      cohort.program_id,
      cohort.duration,
      cohort.program_id,
    ).then((allBreakouts) => {
      // logger.info(`All breakouts scheduled for the cohort ${cohort_id} `);
    });
    // logger.info(milestones);
    cohort.milestones = milestones;
    return cohort;
  })
  .catch((err) => {
    logger.error(err);
    return null;
  });

export const beginParallelCohorts = (cohort_ids) => Promise.all(
  cohort_ids.map(cohort_id => Promise.all([
    updateCohortLearners(cohort_id),
    createCohortMilestones(cohort_id),
  ])
    .then(([cohort, milestones]) => {
      createTypeBreakoutsInMilestone(
        cohort_id,
        cohort.program_id,
        cohort.duration,
        cohort.program_id,
      ).then((allBreakouts) => {
        // logger.info(`All breakouts scheduled for the cohort ${cohort_id} `);
      });
      // logger.info(milestones);
      cohort.milestones = milestones;
      return cohort;
    })
    .catch((err) => {
      logger.error(err);
      return null;
    })),
);

export const getUpcomingCohort = (date) => {
  const tonight = date || new Date();
  tonight.setHours(23);
  tonight.setMinutes(59);
  tonight.setSeconds(59);

  return Cohort.findOne({
    where: {
      start_date: { [Sequelize.Op.gt]: tonight },
    },
  });
};

// Replace by findByPK
export const getCohortFromId = (id) => Cohort.findOne({ where: { id } }).then((cohort) => cohort);

export const getCohortMilestones = (id) => Cohort.findByPk(id, {
  include: [
    {
      model: CohortMilestone,
      attributes: ['id', 'milestone_id'],
    },
  ],
});

export const getCohortFromLearnerId = (user_id) => Application.findOne({
  where: {
    user_id,
  },
})
  .then((data) => data.cohort_joining)
  .then(getCohortFromId);

export const getCohortIdFromLearnerId = (learner_id) => Application
  .findOne({
    where: { user_id: learner_id },
  })
  .then(application => application.get({ plain: true }))
  .then(_application => _application.cohort_joining);

export const removeLearnerFromCohort = async (learner_id, cohort_id) => {
  let cohort = await getCohortFromId(cohort_id);
  cohort = cohort.learners;
  cohort = cohort.filter((learner) => learner !== learner_id);
  return Cohort.update(
    {
      learners: cohort,
    },
    {
      where: {
        id: cohort_id,
      },
      returning: true,
    },
  );
};

export const addLearnerToCohort = async (learner_id, cohort_id) => {
  let cohort = await getCohortFromId(cohort_id);
  cohort = cohort.learners;
  cohort.push(learner_id);
  return Cohort.update(
    {
      learners: cohort,
    },
    {
      where: {
        id: cohort_id,
      },
      returning: true,
    },
  );
};

export const addLearnerStatus = async (
  {
    user_id,
    updated_by_id,
    updated_by_name,
    cohort_id,
    future_cohort_id,
    status,
  },
) => {
  let futureCohort;
  let currentCohort;
  let futureCohortName;

  if (future_cohort_id) {
    futureCohort = await getCohortFromId(future_cohort_id);
    if ('name' in futureCohort) {
      futureCohortName = futureCohort.name;
    }
  }

  currentCohort = await getLiveCohortMilestone(cohort_id);
  if (_.isEmpty(currentCohort)) {
    currentCohort = await getCohortFromId(cohort_id);
  }

  let status_reason;
  let milestone_name;
  let milestone_id;
  let cohort_milestone_id;
  let cohort_name;
  let cohort_year;
  let program;
  let duration;
  let cohortDuration;

  if (('milestone.name' in currentCohort) && (currentCohort['milestone.name'])) {
    milestone_name = currentCohort['milestone.name'];
    milestone_id = currentCohort.milestone_id;
    cohort_milestone_id = currentCohort.id;
    cohort_name = currentCohort['cohort.name'];
    cohort_year = currentCohort['cohort.start_date'].getFullYear();
    program = currentCohort['cohort.program_id'];
    duration = currentCohort['cohort.duration'];
  }

  if ((cohort_name === undefined) && ('name' in currentCohort)) {
    cohort_name = currentCohort.name;
    cohort_year = currentCohort.start_date.getFullYear();
    program = currentCohort.program_id;
    duration = currentCohort.duration;
  }

  // NEED TO CHANGE THIS WHILE ADDING DESIGN PROGRAM
  if (duration) {
    cohortDuration = duration === 16 ? 'FT' : 'PT';
  }

  if (status === 'moved') {
    status_reason = `Moved from current cohort: ${cohort_name} ${cohortDuration} ${cohort_year} ${program} to future cohort: ${futureCohortName}`;
  } else if (status === 'staged') {
    status_reason = `Learner staged from ${cohort_name} ${cohortDuration} ${cohort_year} ${program}. Milestone: ${milestone_name}`;
  } else if (status === 'removed') {
    try {
      await removeUserStatus(
        user_id, 'staged', 'Added to Cohort',
        updated_by_id, updated_by_name,
        milestone_id, milestone_name,
        cohort_id, cohort_name,
      );
    } catch (err) {
      console.warn(`Unable to remove user: ${user_id} status: staged`);
    }
    if ((cohort_name !== null) || (cohort_name !== undefined)) {
      status_reason = `Learner removed from cohort: ${cohort_name} ${cohortDuration} ${cohort_year} ${program}. Milestone: ${milestone_name}`;
    }
    status_reason = 'Learner removed. Learner was staged previously';
  } else if (status === 'added-to-cohort') {
    try {
      await removeUserStatus(
        user_id, 'staged', 'Added to Cohort',
        updated_by_id, updated_by_name,
        milestone_id, milestone_name,
        cohort_id, cohort_name,
      );
    } catch (err) {
      console.warn(`Unable to remove user: ${user_id} status: staged`);
    }
    status_reason = `Learner added to cohort: ${cohort_name} ${cohortDuration} ${cohort_year} ${program}`;
  }

  return addUserStatus({
    id: user_id,
    status,
    status_reason,
    updated_by_id,
    updated_by_name,
    cohort_id,
    cohort_name,
    milestone_id,
    milestone_name,
    cohort_milestone_id,
  });
};

export const moveLearnertoDifferentCohort = async (
  {
    learners,
    current_cohort_id,
    future_cohort_id,
    updated_by_id,
    updated_by_name,
  },
) => learners.map(learner_id => Promise.all([
  removeLearnerFromCohort(learner_id, current_cohort_id),
  addLearnerToCohort(learner_id, future_cohort_id),
  updateCohortJoining(learner_id, future_cohort_id),
  removeLearnerFromTeam(learner_id, current_cohort_id),
  moveLearnerToNewGithubTeam(
    learner_id,
    current_cohort_id,
    future_cohort_id,
  ),
  removeLearnerBreakouts(learner_id, current_cohort_id),
  createLearnerBreakouts(learner_id, future_cohort_id),
  moveLearnerToNewSlackChannel(learner_id, current_cohort_id, future_cohort_id),
  addLearnerStatus({
    user_id: learner_id,
    updated_by_id,
    updated_by_name,
    cohort_id: current_cohort_id,
    future_cohort_id,
    status: 'moved',
  }),
]));

export const removeLearner = async ({
  learner_id,
  current_cohort_id,
  updated_by_id,
  updated_by_name,
}) => Promise.all([
  removeLearnerFromCohort(learner_id, current_cohort_id),
  removeLearnerFromTeam(learner_id, current_cohort_id),
  removeLearnerFromGithubTeam(
    learner_id,
    current_cohort_id,
  ),
  removeLearnerBreakouts(learner_id, current_cohort_id),
  changeUserRole(learner_id, USER_ROLES.GUEST),
])
  .then(async (data) => {
    await addLearnerStatus({
      user_id: learner_id,
      updated_by_id,
      updated_by_name,
      cohort_id: current_cohort_id,
      status: 'removed',
    });
    try {
      const slackResponse = await removeLearnerFromSlackChannel(learner_id, current_cohort_id);
      data.push(slackResponse);
      return data;
    } catch (err) {
      data.push('Failed to remove learner from slack');
      return data;
    }
  });

export const addLearner = async ({
  learners, cohort_id, updated_by_id, updated_by_name,
}) => {
  let cohort_milestone = await getLiveCohortMilestone(cohort_id);
  let cohort_breakouts = await getCohortBreakoutsBetweenDates(cohort_id,
    cohort_milestone.release_time, cohort_milestone.review_scheduled);
  let data = { learners, cohort_id };

  try {
    addLearnerToGithubTeam(learner_id, cohort_id),
    await addLearnersToCohortChannel(cohort_id, learners);
    return data;
  } catch (err) {
    return err;
  }
};

export const getAllLearnerDetailsFromCohort = async ({ cohort_id }) => {
  const result = await Cohort.findOne({ where: cohort_id, attributes: ['learners'] });
  return result;
};

// array of objects to array of
