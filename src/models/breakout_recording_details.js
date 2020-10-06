import Sequelize from 'sequelize';
import db from '../database';
import {
  BreakoutRecordings,
} from './breakout_recordings';
import { User } from './user';

export const BreakoutRecordingsDetails = db.define('breakout_recordings_details', {
  id: {
    type: Sequelize.UUID,
    defaultValue: Sequelize.UUIDV4,
    primaryKey: true,
  },
  created_at: {
    type: Sequelize.DATE,
  },
  updated_at: {
    type: Sequelize.DATE,
    defaultValue: Sequelize.literal('NOW()'),
  },
  video_id: {
    type: Sequelize.UUID,
    references: { model: 'breakout_recordings', key: 'id' },
  },
  user_id: {
    type: Sequelize.UUID,
    references: { model: 'users', key: 'id' },
  },
  liked_by_user: {
    type: Sequelize.BOOLEAN,
    defaultValue: false,
  },
  breakout_rating: {
    type: Sequelize.INTEGER,
    allowNull: true,
    defaultValue: 0,
    validate: {
      min: 0,
      max: 4,
    },
  },
});

const { gt } = Sequelize.Op;

// Note: When sort_by likes, we get only liked videos
// When sort by views or
export const getAllLikesRating = (skip = 0,
  limit = 10, sort_by = 'likes') => {
  let where = {};
  let order;
  if (sort_by === 'date') {
    sort_by = 'breakout_recording.created_at';
    order = Sequelize.literal(`${sort_by}`);
  } else {
    if (sort_by === 'views') {
      sort_by = 'breakout_recording.video_views';
    } else if (sort_by === 'rating') {
      where = {
        breakout_rating: { [gt]: 0 },
      };
    }
    where.liked_by_user = true;
    order = Sequelize.literal(`${sort_by} DESC`);
  }
  return BreakoutRecordingsDetails.findAll({
    attributes: [
      'video_id',
      [Sequelize.fn('count', Sequelize.col('liked_by_user')), 'likes'],
      [Sequelize.fn('avg', Sequelize.col('breakout_rating')), 'rating'],
    ],
    group: [
      'breakout_recordings_details.video_id',
      'breakout_recording.catalyst_id',
      'breakout_recording.video_views',
      'breakout_recording.recording_url',
      'breakout_recording.created_at',
      'breakout_recording.user.id',
    ],
    where,
    offset: skip,
    limit,
    include: [
      {
        model: BreakoutRecordings,
        include: [{
          model: User,
          attributes: ['name'],
        }],
        attributes: ['catalyst_id', 'video_views', 'recording_url', 'created_at'],
      },
    ],
    raw: true,
    order,
  });
};

export const getVideoByCatalyst = (catalyst_id, skip = 0,
  limit = 10, sort_by = 'likes') => {
  let where = {};
  let order;
  if (sort_by === 'date') {
    sort_by = 'breakout_recording.created_at';
    order = Sequelize.literal(`${sort_by}`);
  } else {
    if (sort_by === 'views') {
      sort_by = 'breakout_recording.video_views';
    } else if (sort_by === 'rating') {
      where = {
        breakout_rating: { [gt]: 0 },
      };
    }
    where.liked_by_user = true;
    order = Sequelize.literal(`${sort_by} DESC`);
  }
  where['breakout_recording.catalyst_id'] = catalyst_id;
  return BreakoutRecordingsDetails.findAll({
    attributes: [
      'video_id',
      [Sequelize.fn('count', Sequelize.col('liked_by_user')), 'likes'],
      [Sequelize.fn('avg', Sequelize.col('breakout_rating')), 'rating'],
    ],
    group: [
      'breakout_recordings_details.video_id',
      'breakout_recording.catalyst_id',
      'breakout_recording.video_views',
      'breakout_recording.recording_url',
      'breakout_recording.created_at',
      'breakout_recording.user.id',
    ],
    where,
    offset: skip,
    limit,
    include: [
      {
        model: BreakoutRecordings,
        include: [{
          model: User,
          attributes: ['name'],
        }],
        attributes: ['catalyst_id', 'video_views', 'recording_url', 'created_at'],
      },
    ],
    raw: true,
    order,
  });
};

export const getVideoLikesRating = async (video_id, user_id, sort_by = 'likes') => {
  let where = {};
  let order;
  if (sort_by === 'date') {
    sort_by = 'breakout_recording.created_at';
    order = Sequelize.literal(`${sort_by}`);
  } else {
    if (sort_by === 'views') {
      sort_by = 'breakout_recording.video_views';
    } else if (sort_by === 'rating') {
      where = {
        breakout_rating: { [gt]: 0 },
      };
    }
    where.liked_by_user = true;
    order = Sequelize.literal(`${sort_by} DESC`);
  }
  where.video_id = video_id;

  let breakoutDetails = {};
  breakoutDetails = await BreakoutRecordingsDetails.findAll({
    attributes: [
      'video_id',
      [Sequelize.fn('count', Sequelize.col('liked_by_user')), 'likes'],
      [Sequelize.fn('avg', Sequelize.col('breakout_rating')), 'rating'],
    ],
    group: [
      'breakout_recordings_details.video_id',
      'breakout_recording.catalyst_id',
      'breakout_recording.video_views',
      'breakout_recording.recording_url',
      'breakout_recording.created_at',
      'breakout_recording.user.id',
    ],
    where,
    include: [
      {
        model: BreakoutRecordings,
        include: [{
          model: User,
          attributes: ['name'],
        }],
        attributes: ['catalyst_id', 'video_views', 'recording_url', 'created_at'],
      },
    ],
    raw: true,
    order,
  });
  let userInfo = await BreakoutRecordingsDetails.findOne({
    where: {
      video_id,
      user_id,
    },
    include: [{
      model: User,
      attributes: ['name'],
    }],
    raw: true,
  });

  let breakoutInfo = { ...breakoutDetails, ...userInfo };
  return breakoutInfo;
};

export const getVideoLikedByUser = async (user_id, skip = 0,
  limit = 10, sort_by = 'likes') => {
  let userLikedVideos = await BreakoutRecordingsDetails.findAll({
    attributes: ['video_id'],
    where: {
      user_id,
    },
    raw: true,
  });
  let where = {};
  let order;
  if (sort_by === 'date') {
    sort_by = 'breakout_recording.created_at';
    order = Sequelize.literal(`${sort_by}`);
  } else {
    if (sort_by === 'views') {
      sort_by = 'breakout_recording.video_views';
    } else if (sort_by === 'rating') {
      where = {
        breakout_rating: { [gt]: 0 },
      };
    }
    where.liked_by_user = true;
    order = Sequelize.literal(`${sort_by} DESC`);
  }
  where.video_id = { [Sequelize.Op.in]: userLikedVideos };
  return BreakoutRecordingsDetails.findAll({
    attributes: [
      'video_id',
      [Sequelize.fn('count', Sequelize.col('liked_by_user')), 'likes'],
      [Sequelize.fn('avg', Sequelize.col('breakout_rating')), 'rating'],
    ],
    group: [
      'breakout_recordings_details.video_id',
      'breakout_recording.catalyst_id',
      'breakout_recording.video_views',
      'breakout_recording.recording_url',
      'breakout_recording.created_at',
      'breakout_recording.user.id',
    ],
    where,
    offset: skip,
    limit,
    include: [
      {
        model: BreakoutRecordings,
        include: [{
          model: User,
          attributes: ['name'],
        }],
        attributes: ['catalyst_id', 'video_views', 'recording_url', 'created_at'],
      },
    ],
    raw: true,
    order,
  });
};

export const createRecordingEntry = (
  video_id,
  liked_by_user,
  user_id,
  breakout_rating,
) => BreakoutRecordingsDetails.create(
  {
    video_id,
    liked_by_user,
    breakout_rating,
    user_id,
    created_at: Sequelize.literal('NOW()'),
  },
);

export const updateRecordingDetails = (
  video_id, liked_by_user, breakout_rating,
  user_id,
) => BreakoutRecordings.update({
  liked_by_user, breakout_rating,
}, {
  where: {
    video_id,
    user_id,
  },
});
