import uuid from 'uuid/v4';
import {
  LearnerBreakout,
  createLearnerBreakouts,
  createLearnerBreakoutsForLearners,
} from '../../models/learner_breakout';
import { CohortBreakout } from '../../models/cohort_breakout';

import { User } from '../../models/user';

export const getLearnerBreakouts = (req, res) => {
  LearnerBreakout.findAll({
    attributes: ['cohort_breakout_id'],
  })
    .then((data) => res.json(data))
    .catch((err) => {
      console.error(err.stack);
      res.status(500);
    });
};

export const learnerBreakoutsCreate = (req, res) => {
  const { learner_id, cohort_id } = req.body;

  createLearnerBreakouts(learner_id, cohort_id)
    .then((data) => res.json(data))
    .catch((err) => {
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
    .then((data) => res.json(data))
    .catch((err) => {
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
    .catch((err) => {
      console.error(err.stack);
      res.status(500);
    });
};

export const getLearnerBreakoutsByBreakoutId = (req, res) => {
  const { cohort_breakout_id } = req.params;
  LearnerBreakout.findAll({
    where: {
      cohort_breakout_id,
    },
    include: [{
      model: User,
    }],
  })
    .then((data) => res.json({
      text: 'Learner breakouts for a cohort breakout',
      data,
    }))
    .catch((err) => {
      console.error(err.stack);
      res.status(500);
    });
};

export const markAttendance = (req, res) => {
  const { learnerBreakouts } = req.body;
  Promise.all(
    learnerBreakouts.map((breakout) => LearnerBreakout.update(
      {
        attendance: breakout.attendance,
      },
      {
        where: {
          id: breakout.id,
        },
      },
    )),
  )
    .then(() => {
      res.json({
        text: 'Mark attendance success',
      });
    })
    .catch((err) => {
      console.error(err.stack);
      res.status(500);
    });
};

export const createLearnerBreakoutsForLearnersEndpoint = async (req, res) => {
  let { cohort_breakout_id, learners } = req.body;
  try {
    let bk = await createLearnerBreakoutsForLearners(
      cohort_breakout_id,
      learners,
    );
    res.send({
      data: bk,
      desc: 'Creates learner breakouts of passed learners',
    });
  } catch (err) {
    res.status(500).send(err);
  }
};

export const getLearnerBreakoutsByUserId = (req, res) => {
  const { cohort_breakout_id } = req.query;
  const { learner_id } = req.params;
  LearnerBreakout.findOne({
    where: {
      cohort_breakout_id,
      learner_id
    }
  })
    .then((data) => res.json({
      text: 'Learner breakouts by learner and cohort',
      data,
    }))
    .catch((err) => {
      console.error(err.stack);
      res.status(500);
    });
};
