import Sequelize from 'sequelize';
import _ from 'lodash';
import { Cohort } from '../../models/cohort';
import { LearnerBreakout } from '../../models/learner_breakout';
import { User } from '../../models/user';
import { CohortBreakout, updateCohortBreakoutStatus } from '../../models/cohort_breakout';
import { downloadResource } from '../../util/csv-saver';
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
  order: Sequelize.literal('time_scheduled DESC'),
  limit: number,
  raw: true,
});

export const lastSessionsAttended = async (learner_id, number) => LearnerBreakout.findAll({
  where: {
    learner_id,
    attendance: true,
    '$cohort_breakout.time_scheduled$': { [lte]: Sequelize.literal('NOW()') },
  },
  attributes: ['cohort_breakout_id', 'learner_id', 'attendance', 'cohort_breakout.time_scheduled', 'cohort_breakout.cohort_id'],
  include: [
    {
      model: CohortBreakout,
      include: [{
        model: Cohort,
        attributes: ['name', 'duration', 'start_date'],
      },
      ],
      attributes: [],
      required: false,
    },
  ],
  order: Sequelize.literal('time_scheduled DESC'),
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

export const getAllLearnerAttendance = async ({
  offset, limit, order, filters,
}) => {
  let whereObj = {};
  let filterCohorts = true;
  // Filters on Learner Roles
  if ('active-learners' in filters && filters['active-learners']) {
    whereObj.roles = { [Sequelize.Op.contains]: ['learner'] };
  } else {
    whereObj.roles = { [Sequelize.Op.contains]: ['guest'] };
  }
  // Filters on Users
  if ('users' in filters && filters.users) {
    if ('name' in filters.users && filters.users.name) {
      whereObj.name = {
        [Sequelize.Op.iLike]: `%${filters.users.name}%`,
      };
    }
    if ('status' in filters.users && filters.users.status) {
      whereObj.status = {
        [Sequelize.Op.overlap]: filters.users.status,
      };
    }
    if ('ids' in filters.users && filters.users.ids) {
      whereObj.id = {
        [Sequelize.Op.in]: filters.users.ids,
      };
      filterCohorts = false;
    }
  }
  let whereCohorts = {
    status: 'live',
  };
  let allCohorts = await Cohort.findAll({
    where: whereCohorts,
    raw: true,
  });
  let cohort = arrayToObject(allCohorts);
  // Filters on Cohort
  if (filterCohorts && ('cohorts' in filters && filters.cohorts)) {
    let requestedCohorts = allCohorts;
    if ('program' in filters.cohorts && filters.cohorts.program) {
      requestedCohorts = requestedCohorts.filter(
        eachCohort => eachCohort.program_id === filters.cohorts.program,
      );
    }
    if ('duration' in filters.cohorts && filters.cohorts.duration) {
      requestedCohorts = requestedCohorts.filter(
        eachCohort => eachCohort.duration === filters.cohorts.duration,
      );
    }
    if ('type' in filters.cohorts && filters.cohorts.type) {
      requestedCohorts = requestedCohorts.filter(
        eachCohort => eachCohort.type === filters.cohorts.type,
      );
    }
    if ('name' in filters.cohorts && filters.cohorts.name) {
      requestedCohorts = requestedCohorts.filter(
        eachCohort => eachCohort.name === filters.cohorts.name,
      );
    }
    if ('id' in filters.cohorts && filters.cohorts.id) {
      requestedCohorts = requestedCohorts.filter(eachCohort => eachCohort.id === filters.cohort.id);
    }
    let filteredLearners = requestedCohorts.map(eachCohort => eachCohort.learners);
    let allLearners = [].concat(...filteredLearners);
    if ((offset !== undefined) && (limit !== undefined)) {
      allLearners = allLearners.splice(offset, offset + limit);
    }
    // This is because additional filters on learner name,status and cohort can
    // be applied together
    whereObj.id = { [Sequelize.Op.in]: allLearners };
  }
  let liveLearners = await User.findAll({
    where: whereObj,
    attributes: ['id'],
    limit,
    offset,
    raw: true,
  });
  liveLearners = liveLearners.map(learner => learner.id);

  const learnerAttendance = await LearnerBreakout.findAll({
    attributes: [
      [Sequelize.fn('count', Sequelize.col('attendance')), 'attendance_count'],
      'attendance',
      'learner_id',
      'user.name',
      'user.phone',
      'user.status',
      'user.email',
      'user.role',
      // Groupby can't compare json. Parse it to jsonb[]
      Sequelize.cast(Sequelize.col('user.status_reason'), 'jsonb[]'),
      'cohort_breakout.cohort_id',
      'cohort_breakout.type',
    ],
    where: {
      learner_id: {
        [Sequelize.Op.in]: liveLearners,
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
      'user.phone', 'user.status', 'user.role', Sequelize.cast(Sequelize.col('user.status_reason'), 'jsonb[]'),
    ],
    raw: true,
    order: Sequelize.literal('learner_id, attendance_count DESC'),
  });
  const grouped = _.chain(learnerAttendance)
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
      last_sessions_attended: await lastSessionsAttended(key, 2),
    },
  })));
  return {
    attendance,
    liveCohorts: Object.values(cohort),
  };
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

const attendanceFormat = (attendanceData) => {
  let allLearnerInformation = attendanceData.map(eachLearner => {
    let learnerExcelInformation = {
      learner_id: eachLearner.learner_id,
      name: eachLearner.attendance[0].name,
      email: eachLearner.attendance[0].email,
      phone: eachLearner.attendance[0].phone,
    };
    let lecturesAttended;
    let lecturesAbsent;
    let lastBreakoutAttended;
    let lastLastBreakoutAttended;
    eachLearner.attendance.map(session => {
      if (session.type === 'lecture') {
        if (session.attendance) {
          lecturesAttended = session.attendance_count;
        } else {
          lecturesAbsent = session.attendance_count;
        }
      }
    });
    let cohortName;
    let cohortDuration;
    let lastCohortName;
    let lastCohortDuration;
    let cohortStartYear;
    let lastcohortStartYear;
    try {
      lastBreakoutAttended = eachLearner.last_five_breakouts.last_sessions_attended[0].time_scheduled;
      lastLastBreakoutAttended = eachLearner.last_five_breakouts.last_sessions_attended[1].time_scheduled;
      lastCohortName = eachLearner.last_five_breakouts.last_sessions_attended[0]['cohort_breakout.cohort.name'];
      let cohort_duration = eachLearner.last_five_breakouts.last_sessions_attended[0]['cohort_breakout.cohort.duration'];
      lastCohortDuration = cohort_duration === 16 ? 'Full Time' : 'Part Time';
      lastcohortStartYear = eachLearner.last_five_breakouts.last_sessions_attended[0]['cohort_breakout.cohort.start_date'].getFullYear();
    } catch (err) {
      logger.warn('No Breakout Present');
    }
    if (('currentCohort' in eachLearner) && (eachLearner.currentCohort)) {
      cohortName = eachLearner.currentCohort.name;
      cohortDuration = eachLearner.currentCohort.duration === 16 ? 'Full Time' : 'Part Time';
      cohortStartYear = eachLearner.currentCohort.start_date.getFullYear();
    } else if (eachLearner.status.indexOf('graduated') > -1) {
      cohortName = lastCohortName;
      cohortDuration = lastCohortDuration;
      cohortStartYear = lastcohortStartYear;
    } else {
      cohortName = 'No Cohort';
      cohortDuration = 'No Cohort';
      cohortStartYear = 'No Cohort';
    }
    learnerExcelInformation.currentCohort = cohortName;
    learnerExcelInformation.cohortDuration = cohortDuration;
    learnerExcelInformation.cohortStartDate = cohortStartYear;
    learnerExcelInformation.lecturesAttended = lecturesAttended;
    learnerExcelInformation.lecturesAbsent = lecturesAbsent;
    learnerExcelInformation.lastBreakoutAttended = lastBreakoutAttended;
    learnerExcelInformation.lastBreakoutAttended = lastLastBreakoutAttended;
    learnerExcelInformation.status = eachLearner.status;
    return learnerExcelInformation;
  });
  return allLearnerInformation;
};

export const getAttendanceForLearners = (req, res) => {
  let {
    page, limit, order, filters, download,
  } = req.body;
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
  getAllLearnerAttendance({
    offset, limit, order, filters,
  })
    .then((data) => {
      if (download) {
        const fileName = `attendance_${new Date().toISOString().split('T')[0]}.csv`;
        let attendanceData = attendanceFormat(data.attendance);
        return downloadResource({
          res, fileName, data: attendanceData, flat: false,
        });
      }
      return res.json({
        text: 'Live cohort attendance data',
        data,
      });
    })
    .catch((err) => {
      logger.error(err);
      res.status(500);
    });
};

export const updateCohortBreakoutStatusAPI = async (req, res) => {
  const {
    breakout_id, status, delete_breakouts,
  } = req.body;

  updateCohortBreakoutStatus(breakout_id, status, delete_breakouts)
    .then((data) => res.json({
      message: 'Updated Cohort Breakout Status',
      data,
      type: 'success',
    }))
    .catch((err) => {
      if (err.name === 'HttpBadRequest') {
        return res.status(err.statusCode).json({
          message: err.message,
          type: 'failure',
        });
      }
      console.error(err);
      return res.sendStatus(500);
    });
};
