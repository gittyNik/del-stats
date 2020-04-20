import Sequelize from 'sequelize';
import db from '../database';


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


// sort by values -> likes, views, created_at
export const getAllRecordings = (skip = 0, limit = 10, sort_by = 'likes') => BreakoutRecordings.findAll({
  offset: skip,
  limit,
  order: [
    [sort_by, 'DESC'],
  ],
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
  recording_url, recording_details) => BreakoutRecordings.create(
  {
    catalyst_id,
    recording_url,
    recording_details,
    created_at: Sequelize.literal('NOW()'),
  },
);

export const updateRecordings = (id, likes, recording_details) => BreakoutRecordings.update({
  likes,
  recording_details
}, { where: { id } });
