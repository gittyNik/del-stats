import Sequelize from 'sequelize';
import _ from 'lodash';
import { Cohort } from '../../models/cohort';
import { LearnerBreakout } from '../../models/learner_breakout';
import { User } from '../../models/user';
import { CohortBreakout } from '../../models/cohort_breakout';
import logger from '../../util/logger';

const { lte } = Sequelize.Op;

const arrayToObject = (array) => array.reduce((obj, item) => {
  obj[item.id] = item;
  return obj;
}, {});

export const lastNBreakoutsForLearner = async (learner_id, number, type = 'lecture') => LearnerBreakout.findAll({
  where: {
    learner_id,
    '$cohort_breakout.type$': type,
    '$cohort_breakout.time_scheduled$': { [lte]: Sequelize.literal('NOW()') },
  },
  attributes: ['cohort_breakout_id', 'learner_id', 'attendance', 'cohort_breakout.time_scheduled', 'cohort_breakout.cohort_id'],
  include: [
    {
      model: CohortBreakout,
      include: [{
        model: Cohort,
        attributes: ['name'],
      },
      ],
      attributes: [],
      required: false,
    },
  ],
  order: Sequelize.literal('cohort_breakout.time_scheduled DESC'),
  limit: number,
  raw: true,
});

export const getLearnersStatus = (
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
      attributes: ['id', 'cohort_id'],
    },
  ],
  order: Sequelize.literal('cohort_breakout.time_scheduled DESC'),
  limit,
});

export const getAllLiveCohortAttendance = async (offset, limit, order) => {
  let allCohorts = await Cohort.findAll({
    where: {
      status: 'live',
    },
    raw: true,
    attributes: ['id', 'name', 'location', 'duration', 'learners', 'type'],
  });
  let cohort = arrayToObject(allCohorts);
  return LearnerBreakout.findAll({
    attributes: [
      [Sequelize.fn('count', Sequelize.col('attendance')), 'attendance_count'],
      'attendance',
      'learner_id',
      'user.name',
      'user.phone',
      'user.status',
      'user.email',
      // Groupby can't compare json. Parse it to jsonb[]
      Sequelize.cast(Sequelize.col('user.status_reason'), 'jsonb[]'),
      'cohort_breakout.cohort_id',
      'cohort_breakout.type',
    ],
    where: {
      // learner_id: {
      //   [Sequelize.Op.in]: Sequelize.literal(
      //     "(SELECT unnest(learners) as learner FROM cohorts WHERE status='live')",
      //   ),
      // },
      learner_id: {
        [Sequelize.Op.in]: Sequelize.literal(
          "(SELECT id FROM users WHERE role='learner')",
        ),
      },
      cohort_breakout_id: {
        [Sequelize.Op.in]: Sequelize.literal(
          '(SELECT id from cohort_breakouts where time_scheduled<NOW())',
        ),
      },
    },
    include: [{
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
    group: ['attendance', 'learner_id', 'user.name', 'user.email',
      'cohort_breakout.cohort_id', 'cohort_breakout.type',
      'user.phone', 'user.status', Sequelize.cast(Sequelize.col('user.status_reason'), 'jsonb[]'),
    ],
    offset,
    limit,
    raw: true,
    order: Sequelize.literal('learner_id, attendance_count DESC'),
  })
    .then(async (learnerBreakout) => {
      const grouped = _.chain(learnerBreakout)
        // Group the elements of Array based on `learner_id` property
        .groupBy('learner_id');
      // `key` is group's name (learner_id), `value` is the array of objects
      const attendance = await Promise.all(grouped.map(async (value, key) => ({
        learner_id: key,
        status: value[0].status,
        status_reason: value[0].status_reason,
        currentCohort: allCohorts.filter(c => c.learners.includes(key))[0],
        attendance: value.map(v => ({
          ...v,
          cohort_name: cohort[v.cohort_id],
        })),
        last_five_breakouts: {
          lecture: await lastNBreakoutsForLearner(key, 5, 'lecture'),
          review: await lastNBreakoutsForLearner(key, 5, 'reviews'),
          assessment: await lastNBreakoutsForLearner(key, 5, 'assessment'),
        },
      })));
      return {
        attendance,
        liveCohorts: Object.values(cohort),
      };
    })
    .catch((err) => {
      console.warn(err);
      return null;
    });
};

export const getAttendanceForCohorts = (req, res) => {
  let { page, limit, order } = req.query;
  if (typeof skip !== 'undefined') {
    page = parseInt(page, 10);
  }
  if (typeof limit !== 'undefined') {
    limit = parseInt(limit, 10);
  }
  let offset;
  if ((limit) && (page)) {
    offset = limit * (page - 1);
  }
  if (order === undefined) {
    order = 'asc';
  }
  getAllLiveCohortAttendance(offset, limit, order)
    .then((data) => res.json({
      text: 'Live cohort attendance data',
      data,
    }))
    .catch((err) => {
      logger.error(err);
      res.status(500);
    });
};
