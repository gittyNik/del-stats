import Sequelize from 'sequelize';
// import { Program } from './program';
import { Application, updateCohortJoining } from './application';
import { User, USER_ROLES, changeUserRole } from './user';
import db from '../database';
import { createCohortMilestones, CohortMilestone, getLiveCohortMilestone } from './cohort_milestone';
import { getCohortBreakoutsBetweenDates } from './cohort_breakout';
// import { BreakoutTemplate, CreateBreakoutsInMilestone } from './breakout_template';
import { createTypeBreakoutsInMilestone } from './breakout_template';
import { removeLearnerBreakouts, createLearnerBreakouts, createLearnerBreakoutsForCurrentMS } from './learner_breakout';
import { moveLearnerToNewGithubTeam, deleteGithubRepository, addLearnerToGithubTeam } from '../integrations/github/controllers';
import { removeLearnerFromSlackChannel, moveLearnerToNewSlackChannel, addLearnersToCohortChannel } from './slack_channels';
import { removeLearnerFromGithubTeam } from '../integrations/github/controllers/teams.controller';

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

// TODO: Has a limit of 10 cohorts
// Need to add status in Cohort table and show only live
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

const populateCohortsWithLearners = (cohorts) => {
  const learnerGetters = cohorts.map((cohort) => User.findAll({
    where: { id: { [Sequelize.Op.in]: cohort.learners } },
  }).then((learners) => {
    cohort.learnerDetails = learners;
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
      // console.log(`All breakouts scheduled for the cohort ${cohort_id} `);
    });
    // console.log(milestones);
    cohort.milestones = milestones;
    return cohort;
  })
  .catch((err) => {
    console.error(err);
    return null;
  });

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

const removeLearnerFromCohort = async (learner_id, cohort_id) => {
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

const addLearnerToCohort = async (learner_id, cohort_id) => {
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

export const moveLearnertoDifferentCohort = async (
  learners,
  current_cohort_id,
  future_cohort_id,
) => learners.map(learner_id => Promise.all([
  removeLearnerFromCohort(learner_id, current_cohort_id),
  addLearnerToCohort(learner_id, future_cohort_id),
  updateCohortJoining(learner_id, future_cohort_id),
  moveLearnerToNewGithubTeam(
    learner_id,
    current_cohort_id,
    future_cohort_id,
  ),
  removeLearnerBreakouts(learner_id, current_cohort_id),
  createLearnerBreakouts(learner_id, future_cohort_id),
  moveLearnerToNewSlackChannel(learner_id, current_cohort_id, future_cohort_id),
]));

export const removeLearner = async (
  learner_id,
  current_cohort_id,
) => Promise.all([
  removeLearnerFromCohort(learner_id, current_cohort_id),
  removeLearnerFromGithubTeam(
    learner_id,
    current_cohort_id,
  ),
  removeLearnerBreakouts(learner_id, current_cohort_id),
  changeUserRole(learner_id, USER_ROLES.GUEST),
])
  .then(async (data) => {
    try {
      const slackResponse = await removeLearnerFromSlackChannel(learner_id, current_cohort_id);
      data.push(slackResponse);
      return data;
    } catch (err) {
      data.push('Failed to remove learner from slack');
      return data;
    }
  });

export const addLearner = async (learners, cohort_id) => {
  let cohort_milestone = await getLiveCohortMilestone(cohort_id);
  let cohort_breakouts = await getCohortBreakoutsBetweenDates(cohort_id,
    cohort_milestone.release_time, cohort_milestone.review_scheduled);
  let data = [];

  try {
    for (let i = 0; i < learners.length; i++) {
      let learner_id = learners[i];
      let cohort = await addLearnerToCohort(learner_id, cohort_id);
      let application = await updateCohortJoining(learner_id, cohort_id);
      let team = await addLearnerToGithubTeam(learner_id, cohort_id);
      let lBreakout = await createLearnerBreakoutsForCurrentMS(learner_id, cohort_breakouts);
      data.push([cohort, application, team, lBreakout]);
    }
    await addLearnersToCohortChannel(cohort_id, learners);
    return data;
  } catch (err) {
    return err;
  }
};
