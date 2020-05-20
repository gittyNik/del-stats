import Sequelize from 'sequelize';
import uuid from 'uuid/v4';
import db from '../database';
import { Cohort } from './cohort';
import { getCohortBreakoutsByCohortId } from './cohort_breakout';

export const LearnerBreakout = db.define('learner_breakouts', {
  id: {
    type: Sequelize.UUID,
    primaryKey: true,
  },
  cohort_breakout_id: {
    type: Sequelize.UUID,
    references: { model: 'cohort_breakouts', key: 'id' },
  },
  learner_id: {
    type: Sequelize.UUID,
    references: { model: 'users', key: 'id' },
  },
  learner_notes: Sequelize.TEXT,
  learner_feedback: Sequelize.TEXT,
  team_breakout_id: {
    type: Sequelize.UUID,
    references: { model: 'team_breakout', key: 'id' },
  },
  attendance: Sequelize.BOOLEAN,
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
  review_feedback: Sequelize.JSON,
});

export const createLearnerBreakoutsForCohortMilestones = (
  cohort_breakout_id,
  cohort_id,
) => {
  console.log(cohort_breakout_id, cohort_id);
  return Cohort.findOne({
    attributes: ['id', 'learners'],
    where: {
      id: cohort_id,
    },
    raw: true,
  })
    .then((cohort) => {
      let learnerBreakouts = cohort.learners.map((learner) => {
        // console.log(learner, cohort_breakout_id);
        let learnerBreakout = LearnerBreakout.create({
          id: uuid(),
          cohort_breakout_id,
          learner_id: learner,
          attendance: false,
        })
          .then((data) => data.get({ plain: true }))
          .catch((err) => {
            console.error(err);
            return null;
          });
        return learnerBreakout;
      });
      console.log(
        `${learnerBreakouts.length} learner_breakouts created for a cohort_breakout_id: ${cohort_breakout_id}`,
      );
      return learnerBreakouts;
    })
    .catch((err) => {
      console.error(err);
      return null;
    });
};

export const removeLearnerBreakouts = (learner_id) => LearnerBreakout.destroy({
  where: {
    learner_id,
  },
});

export const createLearnerBreakouts = (learner_id,
  future_cohort_id) => getCohortBreakoutsByCohortId(future_cohort_id)
  .then((breakouts) => LearnerBreakout.bulkCreate(
    breakouts.map((breakout) => ({
      id: uuid(),
      learner_id,
      cohort_breakout_id: breakout.id,
      attendance: false,
    })),
  ));

export default LearnerBreakout;
