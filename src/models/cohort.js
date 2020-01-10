import Sequelize from 'sequelize';
import { Program } from './program';
import { Application } from './application';
import { User } from './user';
import db from '../database';
import { createCohortMilestones, CohortMilestone } from './cohort_milestone';
import { CohortBreakout } from './cohort_breakout';

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
});

Program.hasMany(Cohort, { foreignKey: 'program_id' });
Cohort.belongsTo(Program, { foreignKey: 'program_id' });
// Cohort.hasMany(CohortMilestone, { sourceKey: 'cohort_id' });
// CohortMilestone.belongsTo(Cohort, { foreignKey: 'cohort_id' });
Cohort.hasMany(CohortBreakout, { foreignKey: 'cohort_id' });
CohortBreakout.belongsTo(Cohort);

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
  const learnerGetters = cohorts.map(cohort => User.findAll({
    where: { id: { [Sequelize.Op.in]: cohort.learners } },
  })
    .then((learners) => {
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
  })
    .then(populateCohortsWithLearners);
};

export const getCohortLearnerDetails = (id) => Cohort.findByPk(id, { raw: true })
  .then(cohort => populateCohortsWithLearners([cohort])[0]);

// TODO: change this to cohort_joined later
export const updateCohortLearners = (id) => Application.findAll({
  where: { cohort_joining: id, status: 'joined' },
})
  .then(applications => {
    const learners = applications.map(a => a.user_id);
    return db.transaction(transaction => Promise.all([
      Cohort.update({ learners }, {
        where: { id },
        returning: true,
        raw: true,
        transaction,
      })
        .then(rows => rows[1][0]),
      Application.update({ status: 'archieved' }, {
        where: {
          user_id: { [Sequelize.Op.in]: learners },
        },
        transaction,
      }),
    ]))
      .then(([cohort]) => cohort);
  });

export const beginCohortWithId = (cohort_id) => Promise.all([
  updateCohortLearners(cohort_id),
  createCohortMilestones(cohort_id),
])
  .then(([cohort, milestones]) => {
    cohort.milestones = milestones;
    return cohort;
  });
