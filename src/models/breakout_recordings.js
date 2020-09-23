import AWS from 'aws-sdk';
import Sequelize from 'sequelize';
import db from '../database';
import {
  updateOneCohortBreakouts,
  findOneCohortBreakout,
} from './cohort_breakout';

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
  views: {
    type: Sequelize.INTEGER,
    defaultValue: 0,
  },
  likes: {
    type: Sequelize.INTEGER,
    autoIncrement: true,
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

// sort by values -> likes, views, created_at
export const getAllRecordings = (skip = 0, limit = 10, sort_by = 'likes') => BreakoutRecordings.findAll({
  offset: skip,
  limit,
  order: [
    [sort_by, 'DESC'],
  ],
});

export const updateRecordings = (
  id, likes, views, recording_details,
  breakout_template_id,
) => BreakoutRecordings.update({
  likes, recording_details, views, breakout_template_id,
}, {
  where: {
    id,
  },
});

export const getRecordingVideoUrl = (id) => BreakoutRecordings.findOne(
  { where: { id } },
).then(record => {
  let url = getAWSSignedUrl(record.recording_url);
  record.dataValues.url = url;
  let currentViews = record.views + 1;
  updateRecordings(id, record.likes, currentViews);
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

  let breakoutDetails = breakout.details;
  breakoutDetails.recording = { id: video_id };
  updateOneCohortBreakouts(breakoutDetails, cohort_breakout_id);
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
