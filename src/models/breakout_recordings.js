import AWS from 'aws-sdk';
import Sequelize from 'sequelize';
import db from '../database';
import {
  updateOneCohortBreakouts,
  findOneCohortBreakout,
} from './cohort_breakout';
import {
  BreakoutRecordingsDetails,
} from './breakout_recording_details';
import {
  User,
} from './user';
import {
  Topic,
} from './topic';

const privateKey = process.env.CLOUDFRONT_KEY.replace(/\\n/g, '\n');
const publicKey = process.env.PUBLIC_KEY;

export const BreakoutRecordings = db.define('breakout_recordings', {
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
  topics_array: {
    type: Sequelize.ARRAY(
      {
        type: Sequelize.UUID,
        references: { model: 'topics' },
      },
    ),
    allowNull: false,
  },
  recording_url: Sequelize.STRING,
  recording_details: {
    type: Sequelize.JSON,
    allowNull: true,
  },
  video_views: {
    type: Sequelize.INTEGER,
    defaultValue: 0,
  },
  catalyst_id: {
    type: Sequelize.UUID,
    references: { model: 'users', key: 'id' },
  },
  breakout_template_id: {
    type: Sequelize.UUID,
    references: { model: 'breakout_templates', key: 'id' },
  },
});

const cloudFront = new AWS.CloudFront.Signer(publicKey, privateKey);

export const getAllBreakoutRecordings = async ({
  limit, offset, sort_by, topics, user_id,
}) => {
  limit = limit || 10;
  sort_by = sort_by || 'video_views';
  let whereAnotherObj = {};

  if (topics) {
    topics = topics.split(',');
    whereAnotherObj = {
      topics_array: { [Sequelize.Op.contains]: [topics] },
    };
  }

  const allBreakouts = await BreakoutRecordings.findAndCountAll({
    where: whereAnotherObj,
    include: [{
      model: User,
      attributes: ['name'],
    },
    ],
    order: [
      [sort_by, 'DESC'],
    ],
    raw: true,
    limit,
    offset,
  });
  const breakouts = await Promise.all(allBreakouts.rows.map(async eachBreakout => {
    let whereObj = {
      video_id: eachBreakout.id,
    };
    const breakoutDetails = await BreakoutRecordingsDetails.findAll({
      attributes: [
        'video_id',
        [Sequelize.fn('count', Sequelize.col('liked_by_user')), 'likes'],
        [Sequelize.fn('avg', Sequelize.col('breakout_rating')), 'rating'],
      ],
      group: [
        'breakout_recordings_details.video_id',
      ],
      where: whereObj,
      raw: true,
    });
    whereObj.user_id = user_id;
    const currentUserDetails = await BreakoutRecordingsDetails.findOne({
      attributes: [
        'video_id',
        'liked_by_user',
        'breakout_rating',
      ],
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
      eachBreakout.userStats.ratings = 0;
    }
    const topicsData = await Promise.all(eachBreakout.topics_array.map(
      eachTopic => Topic.findByPk(eachTopic, {
        attributes: ['title', 'path', 'optional'],
        raw: true,
      }),
    ));
    eachBreakout.topics = topicsData;
    return eachBreakout;
  }));
  const recordingDetails = { data: breakouts, count: allBreakouts.count, message: 'Fetched Breakouts' };
  return recordingDetails;
};

export const getAWSSignedUrl = (unSignedUrl) => {
  let signedUrl = '';
  cloudFront.getSignedUrl({
    url: unSignedUrl,
    expires: Math.floor((new Date()).getTime() / 1000) + (60 * 60 * 1),
    // Current Time in UTC + time in seconds, (60 * 60 * 1 = 1 hour)
  }, (err, url) => {
    if (err) throw err;
    signedUrl = url;
  });
  return signedUrl;
};

export const getResourceUrl = (cdn, base_path) => {
  let cdn_url = cdn + base_path;
  let url = getAWSSignedUrl(cdn_url);
  return url;
};

export const updateRecordings = (
  id, video_views, recording_details,
  breakout_template_id,
) => BreakoutRecordings.update({
  recording_details, video_views, breakout_template_id,
}, {
  where: {
    id,
  },
  returning: true,
});

export const getRecordingVideoUrl = (id) => BreakoutRecordings.findOne(
  { where: { id } },
).then(record => {
  let cdn_url = process.env.VIDEO_CDN + record.recording_url;
  let url = getAWSSignedUrl(cdn_url);
  record.dataValues.url = url;
  let videoViews = record.video_views + 1;
  updateRecordings(id, videoViews);
  return record;
});

export const getRecordingsById = id => BreakoutRecordings.findOne(
  { where: { id } },
);

export const getRecordingsByCatalyst = (catalyst_id, skip = 0,
  limit = 10, sort_by = 'likes') => BreakoutRecordings.findAll(
  {
    where: { catalyst_id },
    offset: skip,
    limit,
    order: [
      [sort_by, 'DESC'],
    ],
  },
);

export const updateRecordingInCohortBreakout = async (
  video_id,
  cohort_breakout_id,
) => {
  let id = cohort_breakout_id;
  let breakout = await findOneCohortBreakout({ id });

  let breakoutDetails = {};
  if (('details' in breakout) && (breakout.details != null)) {
    breakoutDetails = breakout.details;
  }

  breakoutDetails.recording = { id: video_id };
  updateOneCohortBreakouts(breakoutDetails, breakout);
};

export const createRecordingEntry = (catalyst_id,
  recording_url, recording_details, topics,
  breakout_template_id, cohort_breakout_id) => BreakoutRecordings.create(
  {
    catalyst_id,
    recording_url,
    recording_details,
    created_at: Sequelize.literal('NOW()'),
    topics_array: topics,
    likes: 0,
    breakout_template_id,
  },
).then(async data => {
  await updateRecordingInCohortBreakout(data.id, cohort_breakout_id);
  data.cohort_breakout_id = cohort_breakout_id;
  return data;
});
