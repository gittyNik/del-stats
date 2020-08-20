import Sequelize from 'sequelize';
import _ from 'lodash';
import { Cohort } from '../../models/cohort';
import { LearnerBreakout } from '../../models/learner_breakout';
import { User } from '../../models/user';
import { CohortBreakout } from '../../models/cohort_breakout';

const { lte } = Sequelize.Op;

const arrayToObject = (array) => array.reduce((obj, item) => {
  obj[item.id] = item;
  return obj;
}, {});

export const lastNBreakoutsForLearner = (learner_id, number, type = 'lecture') => LearnerBreakout.findAll({
  where: {
    learner_id,
    '$cohort_breakout.type$': type,
    '$cohort_breakout.time_scheduled$': { [lte]: Sequelize.literal('NOW()') },
  },
  attributes: ['cohort_breakout_id', 'learner_id', 'attendance', 'cohort_breakout.time_scheduled', 'cohort_breakout.cohort_id'],
  include: [
    {
      model: CohortBreakout,
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

export const getAllLiveCohortAttendance = async () => {
  let allCohorts = await Cohort.findAll({
    where: {
      status: 'live',
    },
    raw: true,
    attributes: ['id', 'name', 'location', 'duration', 'learners'],
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
      // Groupby can't compare json. Parse it to json string
      Sequelize.cast(Sequelize.col('user.status_reason'), 'varchar'),
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
    group: ['attendance', 'learner_id', 'user.name',
      'cohort_breakout.cohort_id', 'cohort_breakout.type',
      'user.phone', 'user.status', Sequelize.cast(Sequelize.col('user.status_reason'), 'varchar'),
    ],
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
        currentCohort: allCohorts.filter(c => c.learners.includes(key))[0],
        attendance: value.map(v => ({
          ...v,
          cohort_name: cohort[v.cohort_id],
          status_reason: JSON.parse(v.status_reason),
        })),
        last_five_breakouts: {
          lecture: await lastNBreakoutsForLearner(key, 10, 'lecture').map(bk => {
            const obj = JSON.parse(JSON.stringify(bk));
            obj.cohort = cohort[bk.cohort_id];
            return obj;
          }),
          review: await lastNBreakoutsForLearner(key, 10, 'reviews').map(bk => {
            const obj = JSON.parse(JSON.stringify(bk));
            obj.cohort = cohort[bk.cohort_id];
            return obj;
          }),
          assessment: await lastNBreakoutsForLearner(key, 10, 'assessment').map(bk => {
            const obj = JSON.parse(JSON.stringify(bk));
            obj.cohort = cohort[bk.cohort_id];
            return obj;
          }),
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
