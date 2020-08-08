import Sequelize from 'sequelize';
import { LearnerBreakout } from '../../models/learner_breakout';
import { User } from '../../models/user';

export const getAllLiveCohortAttendance = async () => LearnerBreakout.findAll({
  attributes: [
    [Sequelize.fn('count', Sequelize.col('attendance')), 'attendance_count'],
    'attendance',
    'learner_id',
  ],
  where: {
    learner_id: {
      [Sequelize.Op.in]: Sequelize.literal(
        "(SELECT unnest(learners) as learner FROM cohorts WHERE status='live')",
      ),
    },
  },
  include: [
    {
      model: User,
      attributes: ['name'],
      required: false,
    },
  ],
  group: ['attendance', 'learner_id', 'user.name'],
  raw: true,
  order: Sequelize.literal('attendance_count DESC'),
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
