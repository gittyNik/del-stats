import Sequelize from 'sequelize';
import uuid from 'uuid/v4';
import db from '../database';
import { Cohort } from './cohort';
import { Program } from './program';
import { Milestone } from './milestone';

export const CohortMilestone = db.define('cohort_milestones', {
  id: {
    primaryKey: true,
    type: Sequelize.UUID,
  },
  release_time: Sequelize.DATE,
  cohort_id: {
    type: Sequelize.UUID,
    references: { model: 'cohorts', key: 'id' },
  },
  milestone_id: {
    type: Sequelize.UUID,
    references: { model: 'milestones', key: 'id' },
  },
  reviewer_id: {
    type: Sequelize.UUID,
    references: { model: 'users', key: 'id' },
  },
  review_scheduled: Sequelize.DATE,
  review_time: Sequelize.DATE,
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
});

const { lte, gt } = Sequelize.Op;

CohortMilestone.belongsTo(Milestone);

export const getCurrentCohortMilestones = () => {
  const now = Sequelize.literal('NOW()');
  return CohortMilestone.findAll({
    order: Sequelize.col('release_time'),
    where: {
      release_time: { [lte]: now },
      review_scheduled: { [gt]: now },
    },
    include: [Cohort, Milestone],
    raw: true,
  });
};

export const getCurrentMilestoneOfCohort = (cohort_id) => {
  const now = Sequelize.literal('NOW()');
  return CohortMilestone.findOne({
    order: Sequelize.col('release_time'),
    where: {
      release_time: { [lte]: now },
      review_scheduled: { [gt]: now },
      cohort_id,
    },
    include: [Cohort, Milestone],
    raw: true,
  });
};


const WEEK_SECONDS = 7 * 86400000;

function* calculateReleaseTime(cohort_start) {
  const start = new Date(cohort_start);
  start.setHours(0, 0, 0, 0);
  // Calculate next Wednesday
  start.setDate(cohort_start.getDate() + ((3 + 7 - cohort_start.getDay()) % 7));
  // Calculate 6 hours before a week
  const end = new Date(+start + WEEK_SECONDS - WEEK_SECONDS / 28);

  while (1) {
    yield { start, end };
    start.setTime(+start + WEEK_SECONDS);
    end.setTime(+end + WEEK_SECONDS);
  }
}

export const createCohortMilestones = (cohort_id) => Cohort.findByPk(cohort_id, {
  include: [Program],
  raw: true,
})
  .then(cohort => {
    console.log(cohort);
    const release = calculateReleaseTime(cohort.start_date);
    const cohort_milestones = cohort['program.milestones']
      .map(milestone_id => {
        const {
          start: release_time,
          end: review_scheduled,
        } = release.next().value;

        return {
          id: uuid(),
          release_time,
          cohort_id,
          milestone_id,
          review_scheduled,
        };
      });

    return CohortMilestone.bulkCreate(cohort_milestones);
  });
