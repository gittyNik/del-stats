import { v4 as uuid } from 'uuid';
import {
  LearnerBreakout,
  createLearnerBreakouts,
  createLearnerBreakoutsForLearners,
} from '../../models/learner_breakout';
import { CohortBreakout } from '../../models/cohort_breakout';
import logger from '../../util/logger';

import { User } from '../../models/user';

export const getLearnerBreakouts = (req, res) => {
  LearnerBreakout.findAll({
    attributes: ['cohort_breakout_id'],
  })
    .then((data) => res.json(data))
    .catch((err) => {
      logger.error(err);
      res.status(500);
    });
};

export const learnerBreakoutsCreate = (req, res) => {
  const { learner_id, cohort_id } = req.body;

  createLearnerBreakouts(learner_id, cohort_id)
    .then((data) => res.json(data))
    .catch((err) => {
      logger.error(err);
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
      logger.error(err);
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
      logger.error(err);
      res.status(500);
    });
};

export const getLearnerAttendanceForBreakout = (cohort_breakout_id) => LearnerBreakout.findAll({
  where: {
    cohort_breakout_id,
  },
  include: [{
    model: User,
    attributes: ['name', 'status'],
  }],
});

export const getLearnerBreakoutsByBreakoutId = (req, res) => {
  const { cohort_breakout_id } = req.params;
  getLearnerAttendanceForBreakout(cohort_breakout_id)
    .then((data) => res.json({
      text: 'Learner breakouts for a cohort breakout',
      data,
    }))
    .catch((err) => {
      logger.error(err);
      res.status(500);
    });
};

export const markAttendance = (req, res) => {
  const { learnerBreakouts } = req.body;
  const { user } = req.jwtData;
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
    .then(async () => {
      const cohortBreakout = await CohortBreakout.findOne({
        where: { id: learnerBreakouts[0].cohort_breakout_id },
      });
      let updated_by = cohortBreakout.updated_by_user;
      if (updated_by) {
        let user_details = {
          user_id: user.id,
          name: user.name,
          date: new Date(),
          details: 'Attendance marked',
        };
        updated_by.push(user_details);
      } else {
        updated_by = [{
          user_id: user.id,
          name: user.name,
          date: new Date(),
          details: 'Attendance marked',
        }];
      }
      await CohortBreakout.update({
        status: 'running',
        update_at: Date.now(),
      }, {
        where: {
          id: learnerBreakouts[0].cohort_breakout_id,
        },
      });
      res.json({
        text: 'Mark attendance success',
      });
    })
    .catch((err) => {
      logger.error(err);
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
      learner_id,
    },
  })
    .then((data) => res.json({
      text: 'Learner breakouts by learner and cohort',
      data,
    }))
    .catch((err) => {
      logger.error(err);
      res.status(500);
    });
};
