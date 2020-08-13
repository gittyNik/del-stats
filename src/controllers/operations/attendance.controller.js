import Sequelize from 'sequelize';
import _ from 'lodash';
import { Cohort } from '../../models/cohort';
import { LearnerBreakout } from '../../models/learner_breakout';
import { User } from '../../models/user';
import { CohortBreakout } from '../../models/cohort_breakout';

const arrayToObject = (array) => array.reduce((obj, item) => {
  obj[item.id] = item;
  return obj;
}, {});

export const getLearnersLastFiveBreakouts = async (learner_id) => LearnerBreakout.findAll({
  where: {
    learner_id,
    '$cohort_breakout.type$': 'lecture',
  },
  attributes: ['attendance'],
  include: [
    {
      model: CohortBreakout,
      attributes: ['id'],
    },
  ],
  order: Sequelize.literal('cohort_breakout.time_scheduled DESC'),
  limit: 5,
});

export const getLearnersStatus = async (
  learner_id, type, limit,
) => LearnerBreakout.findAll({
  where: {
    learner_id,
    '$cohort_breakout.type$': type,
  },
  attributes: ['attendance'],
  include: [
    {
      model: CohortBreakout,
      attributes: ['id'],
    },
  ],
  order: Sequelize.literal('cohort_breakout.time_scheduled DESC'),
  limit,
});

export const getAllLiveCohortAttendance = async () => {
  let allCohorts = await Cohort.findAll({
    where: {
      status: 'live',
    },
    raw: true,
    attributes: ['id', 'name'],
  });
  let cohort = arrayToObject(allCohorts);
  return LearnerBreakout.findAll({
    attributes: [
      [Sequelize.fn('count', Sequelize.col('attendance')), 'attendance_count'],
      'attendance',
      'learner_id',
      'user.name',
      'user.phone',
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
    group: ['attendance', 'learner_id', 'user.name',
      'cohort_breakout.cohort_id', 'cohort_breakout.type',
      'user.phone',
    ],
    raw: true,
    order: Sequelize.literal('learner_id, attendance_count DESC'),
  })
    .then((learnerBreakout) => {
      const grouped = _.chain(learnerBreakout)
        // Group the elements of Array based on `learner_id` property
        .groupBy('learner_id')
        // `key` is group's name (learner_id), `value` is the array of objects
        .map((value, key) => ({
          learner_id: key,
          attendance: value.map(v => ({
            ...v,
            cohort_name: cohort[v.cohort_id],
          })),
          last_five_breakouts: {
            lecture: getLearnersStatus(key, 'lecture', 5),
            review: getLearnersStatus(key, 'reviews', 5),
            assessment: getLearnersStatus(key, 'assessment', 5),
          },
        }))
        .value();
      return grouped;
      // console.log(grouped);
    })
    .catch((err) => {
      console.warn(err);
      return null;
    });
};

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
