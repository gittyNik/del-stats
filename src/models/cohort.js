import Sequelize from 'sequelize';
// import { Program } from './program';
import { Application } from './application';
import { User, USER_ROLES } from './user';
import db from '../database';
import { createCohortMilestones, CohortMilestone } from './cohort_milestone';
import {
  getChallengesByUserId, deleteLearnerChallengesByLearnerId,
} from './learner_challenge';
// import { CohortBreakout } from "./cohort_breakout";
// import { BreakoutTemplate, CreateBreakoutsInMilestone } from './breakout_template';
import { createTypeBreakoutsInMilestone } from './breakout_template';
import { removeLearnerBreakouts, createLearnerBreakouts } from './learner_breakout';
import { moveLearnerToNewGithubTeam, deleteGithubRepository } from '../integrations/github/controllers';


export const Cohort = db.define('cohorts', {
  id: {
    type: Sequelize.UUID,
    primaryKey: true,
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

CohortMilestone.belongsTo(Cohort, { foreignKey: 'cohort_id' });

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
  },
  order: [['start_date', 'DESC']],
  limit: 10,
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
      console.log(`All breakouts scheduled for the cohort ${cohort_id} `);
    });
    // console.log(milestones);
    cohort.milestones = milestones;
    return cohort;
  })
  .catch((err) => {
    console.log(err);
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
  learner_id,
  current_cohort_id,
  future_cohort_id,
) => {
  try {
    await removeLearnerFromCohort(learner_id, current_cohort_id);
    await addLearnerToCohort(learner_id, future_cohort_id);
    await moveLearnerToNewGithubTeam(
      learner_id,
      current_cohort_id,
      future_cohort_id,
    );
    await removeLearnerBreakouts(learner_id);
    let breakouts = await createLearnerBreakouts(learner_id, future_cohort_id);
    let learnerChallenges = await getChallengesByUserId(learner_id);
    for (let i = 0; i < learnerChallenges.length; i++) {
      if (learnerChallenges[i].repo) {
        // TODO: @Nik change for loop
        await deleteGithubRepository(learnerChallenges[i].repo);
      }
    }
    await deleteLearnerChallengesByLearnerId(learner_id);
    // TODO: add function for slack channel change
    // await moveLearnerToNewSlackTeam(learner_id, current_cohort_id, future_cohort_id);
    // return breakouts;
    return { breakouts, learnerChallenges };
  } catch (err) {
    return err;
  }
};
