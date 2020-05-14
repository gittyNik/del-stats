import AWS from 'aws-sdk';
import Sequelize from 'sequelize';
import db from '../database';

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

export const updateRecordings = (id, likes, views, recording_details) => BreakoutRecordings.update({
  likes, recording_details, views,
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

export const createRecordingEntry = (catalyst_id,
  recording_url, recording_details, topics) => BreakoutRecordings.create(
  {
    catalyst_id,
    recording_url,
    recording_details,
    created_at: Sequelize.literal('NOW()'),
    topics_array: topics,
    likes: 0,
  },
);
