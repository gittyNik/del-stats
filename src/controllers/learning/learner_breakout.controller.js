import { uuid } from 'uuid/v4';
import { LearnerBreakout } from '../../models/learner_breakout';
import { CohortBreakout } from '../../models/cohort_breakout';

export const getLearnerBreakouts = (req, res) => {
  LearnerBreakout.findAll({
    attributes: ['cohort_breakout_id'],
  })
    .then(data => res.json(data))
    .catch(err => {
      console.error(err.stack);
      res.status(500);
    });
};

export const getUpcomingBreakouts = (req, res) => {
  CohortBreakout.findAll({
    where: {
      status: 'scheduled',
    },
  })
    .then(data => res.json(data))
    .catch(err => {
      console.error(err.stack);
      res.status(500);
    });
};

export const createLearnerBreakout = (req, res) => {
  const {
    cohort_breakout_id,
    learner_id,
    learner_notes,
    learner_feedback,
  } = req.body;
  LearnerBreakout.create({
    id: uuid(),
    cohort_breakout_id,
    learner_id,
    learner_notes,
    learner_feedback,
  })
    .then(() => res.send('Created Learner Breakout'))
    .catch(err => {
      console.error(err.stack);
      res.status(500);
    });
};
