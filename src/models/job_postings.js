import Sequelize from 'sequelize';
import db from '../database';

const STATUS = [
  'active',
  'closed',
  'removed',
  'filled',
  'partially-filled',
];

export const JobPosting = db.define('job_postings', {
  id: {
    type: Sequelize.UUID,
    defaultValue: Sequelize.UUIDV4,
    primaryKey: true,
  },
  company_id: {
    type: Sequelize.UUID,
    references: { model: 'company_profile', key: 'id' },
  },
  description: Sequelize.TEXT,
  status: {
    type: Sequelize.ENUM(...STATUS),
  },
  views: {
    type: Sequelize.INTEGER,
    defaultValue: 0,
  },
  interested: {
    type: Sequelize.INTEGER,
    defaultValue: 0,
  },
  created_at: {
    type: Sequelize.DATE,
  },
  updated_at: {
    type: Sequelize.DATE,
    defaultValue: Sequelize.literal('NOW()'),
  },
  tags: {
    type: Sequelize.ARRAY(Sequelize.UUID),
  },
  posted_by: {
    type: Sequelize.ARRAY(Sequelize.JSON),
  },
});

export default JobPosting;
