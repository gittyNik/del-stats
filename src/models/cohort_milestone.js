import Sequelize from 'sequelize';
import uuid from 'uuid/v4';
import db from '../database';
import { Cohort } from './cohort';
import { CohortBreakout } from './cohort_breakout';
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

// milestone_id=null represents the topics belonging to the program
const findTopicsForCohortAndMilestone = (cohort_id, milestone_id = null) => Topic.findAll({
  where: { milestone_id },
  raw: true,
  include: [{
    model: CohortBreakout,
    where: {
      cohort_id,
      topic_id: Sequelize.literal('"topics"."id"=cohort_breakouts.topic_id'),
    },
    required: false,
  }],
});

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
      if (!milestone) return milestone;
      const { milestone_id } = milestone;
      return Promise.all([
        findTopicsForCohortAndMilestone(cohort_id, milestone_id),
        findTopicsForCohortAndMilestone(cohort_id),
      ])
        .then(([topics, programTopics]) => {
          console.log(`Milestone topics: ${topics.length}, Program topics: ${programTopics.length}`);
          milestone.topics = topics;
          milestone.programTopics = programTopics;
          return milestone;
        });
    });
};

function* calculateReleaseTime(cohort_start, pending) {
  const DAY_MSEC = 86400000;
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
      const { value } = release.next();

      return {
        id: uuid(),
        release_time: new Date(value.start),
        cohort_id,
        milestone_id,
        review_scheduled: new Date(value.end),
      };
    });

    return CohortMilestone.bulkCreate(cohort_milestones);
  });
