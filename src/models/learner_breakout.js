import Sequelize from 'sequelize';
import uuid from 'uuid/v4';
import db from '../database';
import { Cohort } from './cohort';

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
});

export const createLearnerBreakoutsForCohortMilestones = (cohort_breakout_id, cohort_id) => {
  return Cohort.findOne({
    attributes: ['id', 'learners'],
    where: {
      id: cohort_id,
    },
    raw: true,
  })
    .then((cohort) => {
      let learnerBreakouts = cohort.learners.map((learner) => {
        let learnerBreakout = LearnerBreakout.create({
          id: uuid(),
          cohort_breakout_id,
          learner_id: learner,
          attendance: false,
        })
          .then(data => data.get({ plain: true }))
          .catch(err => {
            console.error(err);
            return null;
          });
        return learnerBreakout;
      });
      console.log(`${learnerBreakouts.length} learner_breakouts created for a cohort_breakout_id: ${cohort_breakout_id}`);
      return learnerBreakouts;
    })
    .catch(err => {
      console.error(err);
      return null;
    });
};

export default LearnerBreakout;
