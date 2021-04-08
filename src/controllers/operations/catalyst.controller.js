import { v4 as uuid } from 'uuid';
import moment from 'moment';
import Sequelize, { Op } from 'sequelize';
import { USER_ROLES, User } from '../../models/user';
import { CohortBreakout } from '../../models/cohort_breakout';
import { BreakoutRecordings } from '../../models/breakout_recordings';
import { BreakoutRecordingsDetails } from '../../models/breakout_recording_details';
import { Topic } from '../../models/topic';
import { logger } from '../../util/logger';

const MILLI_SEC_HOUR = 1 * 60 * 60 * 1000;

export const addCatalyst = (req, res) => {
  const { name, email, phone } = req.body;
  User.create({
    id: uuid(),
    name,
    email,
    phone,
    role: USER_ROLES.CATALYST,
    roles: [USER_ROLES.CATALYST],
  })
    .then((data) => res.json({
      text: 'Catalyst added',
      data,
    }))
    .catch((err) => {
      logger.error(err);
      res.status(500);
    });
};

export const completedBreakoutsByCatalyst = async ({ catalyst_id }) => await CohortBreakout.findAll({
  where: {
    catalyst_id,
    status: 'completed',
  },
  raw: true,
});

export const cumulativeTimeTaken = async (catalyst_id) => {
  const convertMilisIntoHours = (milis) => (milis / MILLI_SEC_HOUR).toFixed(2);

  try {
    let today = await CohortBreakout.sum('time_taken_by_catalyst', {
      where: {
        catalyst_id,
        time_started: { [Op.gte]: new Date(new Date().setHours(0, 0, 0, 0)) },
      },
    });
    let thisWeek = await CohortBreakout.sum('time_taken_by_catalyst', {
      where: {
        catalyst_id,
        time_started: { [Op.gte]: moment().startOf('week').toDate() },
      },
    });
    let thisMonth = await CohortBreakout.sum('time_taken_by_catalyst', {
      where: {
        catalyst_id,
        time_started: { [Op.gte]: moment().startOf('month').toDate() },
      },
    });
    let overall = await CohortBreakout.sum('time_taken_by_catalyst', {
      where: { catalyst_id },
    });

    let todayBOCount = await CohortBreakout.count({
      where: {
        catalyst_id,
        time_started: { [Op.gte]: new Date(new Date().setHours(0, 0, 0, 0)) },
      },
    });
    let thisWeekBOCount = await CohortBreakout.count({
      where: {
        catalyst_id,
        time_started: { [Op.gte]: moment().startOf('week').toDate() },
      },
    });
    let thisMonthBOCount = await CohortBreakout.count({
      where: {
        catalyst_id,
        time_started: { [Op.gte]: moment().startOf('month').toDate() },
      },
    });
    let overallBOCount = await CohortBreakout.count({
      where: { catalyst_id },
    });

    const data = {
      daily: {
        hours: convertMilisIntoHours(parseInt(today, 10) || 0),
        sessions: parseInt(todayBOCount, 10) || 0,
      },
      weekly: {
        hours: convertMilisIntoHours(parseInt(thisWeek, 10) || 0),
        sessions: parseInt(thisWeekBOCount, 10) || 0,
      },
      monthly: {
        hours: convertMilisIntoHours(parseInt(thisMonth, 10) || 0),
        sessions: parseInt(thisMonthBOCount, 10) || 0,
      },
      overall: {
        hours: convertMilisIntoHours(parseInt(overall, 10) || 0),
        sessions: parseInt(overallBOCount, 10) || 0,
      },
    };

    return data;
  } catch (err) {
    console.error(err.message, err);
    return err;
  }
};

export const cumulativeTimeTakenApi = async (req, res) => {
  const catalyst_id = req.params.id ? req.params.id : req.jwtData.user.id;

  try {
    const data = await cumulativeTimeTaken(catalyst_id);

    res.json({
      message: 'cumulativeTimeTaken Success!',
      type: 'Success',
      data,
    });
  } catch (e) {
    res.json({
      message: err.message,
      type: 'Failure',
      data: err,
    });
  }
};

export const sessionsStartedOnTime = async (req, res) => {
  const catalyst_id = req.params.id ? req.params.id : req.jwtData.user.id;

  try {
    const data = await CohortBreakout.count({
      where: { catalyst_id, time_started: { [Op.lte]: 'time_scheduled' } },
    });

    res.json({
      message: `Count of Sessions started on time is  ${
        parseInt(data, 10) || 0
      }`,
      type: 'Success',
      data,
    });
  } catch (err) {
    console.error(err);
    res.status(500);
  }
};

export const getAllBreakoutRecordingsForCatalyst = async ({
  limit,
  offset,
  sort_by,
  topics,
  catalyst_id,
}) => {
  limit = limit || 10;
  sort_by = sort_by || 'video_views';
  let whereAnotherObj = {
    catalyst_id,
  };

  try {
    if (topics) {
      topics = topics.split(',');
      whereAnotherObj = {
        topics_array: { [Sequelize.Op.contains]: [topics] },
      };
    }

    const allBreakouts = await BreakoutRecordings.findAndCountAll({
      where: whereAnotherObj,
      include: [
        {
          model: User,
          attributes: ['name'],
        },
      ],
      order: [[sort_by, 'DESC']],
      raw: true,
      limit,
      offset,
    });

    const breakouts = await Promise.all(
      allBreakouts.rows.map(async (eachBreakout) => {
        let whereObj = {
          video_id: eachBreakout.id,
        };
        const breakoutDetails = await BreakoutRecordingsDetails.findAll({
          attributes: [
            'video_id',
            [Sequelize.fn('count', Sequelize.col('liked_by_user')), 'likes'],
            [Sequelize.fn('avg', Sequelize.col('breakout_rating')), 'rating'],
          ],
          group: ['breakout_recordings_details.video_id'],
          where: whereObj,
          raw: true,
        });

        const currentUserDetails = await BreakoutRecordingsDetails.findOne({
          attributes: ['video_id', 'liked_by_user', 'breakout_rating'],
          where: whereObj,
          raw: true,
        });
        if (breakoutDetails.length > 0) {
          const { likes, rating } = breakoutDetails[0];
          eachBreakout.likes = parseInt(likes, 10);
          eachBreakout.ratings = parseFloat(rating);
        } else {
          eachBreakout.likes = 0;
          eachBreakout.ratings = 0;
        }
        eachBreakout.userStats = {};
        if (currentUserDetails && currentUserDetails.length > 0) {
          const { liked_by_user, breakout_rating } = currentUserDetails[0];
          eachBreakout.userStats.liked = liked_by_user;
          eachBreakout.userStats.rating = parseFloat(breakout_rating);
        } else {
          eachBreakout.userStats.liked = false;
          eachBreakout.userStats.rating = 0;
        }
        const topicsData = await Promise.all(
          eachBreakout.topics_array.map((eachTopic) => Topic.findByPk(eachTopic, {
            attributes: ['title', 'path', 'optional'],
            raw: true,
          })),
        );
        eachBreakout.topics = topicsData;
        return eachBreakout;
      }),
    );

    const recordingDetails = {
      data: breakouts,
      count: allBreakouts.count,
      message: 'Fetched Breakouts',
    };
    return recordingDetails;
  } catch (e) {
    console.log(err);
  }
};

export const getAllBreakoutRecordingsForCatalystApi = async (req, res) => {
  let {
    limit, offset, sort_by, topics, user_id,
  } = req.body;
  const catalyst_id = user_id || req.params.id;
  limit = limit || 10;
  sort_by = sort_by || 'video_views';

  try {
    const data = await getAllBreakoutRecordingsForCatalyst({
      limit,
      offset,
      sort_by,
      topics,
      catalyst_id,
    });

    res.json({
      message: 'getAllBreakoutRecordingsForCatalyst Success',
      type: 'Success',
      data,
    });
  } catch (err) {
    logger.error(err);

    res.json({
      message: err.message,
      type: 'failure',
    });
  }
};

export const getCumulativeTimeTakenForAll = async (req, res) => {
  let { limit, offset } = req.body;
  limit = limit || 5;
  offset = offset || 0;

  try {
    // roles: { [Op.contains]: ["catalyst"] },
    const AllCatalystIDs = await User.findAll({
      where: {
        role: 'catalyst',
      },
      attributes: ['id', 'name', 'email', 'phone'],
      raw: true,
      limit,
      offset,
    });

    const resData = await Promise.all(
      AllCatalystIDs.map(
        async (catalyst) => {
          catalyst.cumulativeTimeTaken = await cumulativeTimeTaken(catalyst.id);
          return catalyst;
        },
      ),
    );

    res.json({
      message: 'cumulativeTimeTaken for all Success!',
      type: 'Success',
      data: resData,
    });
  } catch (err) {
    res.json({
      message: err.message,
      type: 'Failure',
      data: err,
    });
  }
};
