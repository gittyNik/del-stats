import Sequelize from 'sequelize';
import { LearnerBreakout } from '../../models/learner_breakout';
import { User } from '../../models/user';
import { CohortBreakout } from '../../models/cohort_breakout';

export const getAllLiveCohortAttendance = async () => LearnerBreakout.findAll({
  attributes: [
    [Sequelize.fn('count', Sequelize.col('attendance')), 'attendance_count'],
    'attendance',
    'learner_id',
    'user.name',
    'cohort_breakout.cohort_id',
    'cohort_breakout.type',
  ],
  where: {
    learner_id: {
      [Sequelize.Op.in]: Sequelize.literal(
        "(SELECT unnest(learners) as learner FROM cohorts WHERE status='live')",
      ),
    },
    cohort_breakout_id: {
      [Sequelize.Op.in]: Sequelize.literal(
        '(SELECT id from cohort_breakouts where time_scheduled<NOW())',
      ),
    },
  },
  include: [
    {
      model: User,
      attributes: [],
      required: false,
    },
    {
      model: CohortBreakout,
      attributes: [],
      required: false,
    },
  ],
  group: ['attendance', 'learner_id', 'user.name', 'cohort_breakout.cohort_id', 'cohort_breakout.type'],
  raw: true,
  order: Sequelize.literal('learner_id, attendance_count DESC'),
})
  .then((learnerBreakout) => learnerBreakout)
  .catch((err) => {
    console.warn(err);
    return null;
  });

export const getAttendanceForCohorts = (req, res) => {
  getAllLiveCohortAttendance()
    .then((data) => res.json({
      text: 'Live cohort attendance data',
      data,
    }))
    .catch((err) => {
      console.error(err);
      res.status(500);
    });
};

export default getAllLiveCohortAttendance;
