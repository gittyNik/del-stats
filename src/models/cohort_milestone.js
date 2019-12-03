import Sequelize from 'sequelize';
import uuid from 'uuid/v4';
import db from '../database';
import { Cohort } from './cohort';
import { Program } from './program';
import { Milestone } from './milestone';
import { Topic } from './topic';

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
  })
    .then(milestone => {
      const { milestone_id } = milestone;
      return Topic.findAll({ where: { milestone_id }, raw: true })
        .then(topics => {
          milestone.topics = topics;
          return milestone;
        });
    });
};

const DAY_MSEC = 86400000;

function* calculateReleaseTime(cohort_start, pending) {
  const start = new Date(cohort_start);
  start.setHours(0, 0, 0, 0);
  // Calculate first Monday
  start.setDate(cohort_start.getDate() + ((1 + 7 - cohort_start.getDay()) % 7));
  // Calculate Tuesday 6 pm
  const end = new Date(+start + DAY_MSEC * 1.75);

  while (pending--) {
    if (pending === 0) { // Calculate next friday
      end.setDate(start.getDate() + ((5 + 7 - cohort_start.getDay()) % 7));
    }
    yield { start, end };
    start.setTime(+end + DAY_MSEC / 4);
    end.setTime(+end + DAY_MSEC * 7);
  }
}

export const createCohortMilestones = (cohort_id) => Cohort.findByPk(cohort_id, {
  include: [Program],
  raw: true,
})
  .then(cohort => {
    const milestones = cohort['program.milestones'];
    const release = calculateReleaseTime(cohort.start_date, milestones.length);
    const cohort_milestones = milestones.map(milestone_id => {
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
