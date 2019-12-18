import Sequelize from 'sequelize';
import db from '../database';

export const JobApplication = db.define('job_applications', {
  id: {
    type: Sequelize.UUID,
    primaryKey: true,
  },
  job_posting_id: {
    type: Sequelize.UUID,
    references: { model: 'job_postings', key: 'id' },
  },
  applicant_id: {
    type: Sequelize.UUID,
    references: { model: 'portfolios', key: 'id' },
  },
  review: Sequelize.TEXT,
  status: Sequelize.STRING,
  offer_details: Sequelize.TEXT,
  applicant_feedback: Sequelize.TEXT,
  counsellor_notes: Sequelize.TEXT,
});

export default JobApplication;
