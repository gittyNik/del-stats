import Sequelize from 'sequelize';
import db from '../database';

const APPLICATION_STATUS = [
  'active',
  'assignment',
  'interview',
  'shortlisted',
  'hired',
];

const ASSIGNMENT_STATUS = [
  'sent',
  'accepted',
  'started',
  'completed',
  'reviewed',
];

const OFFER_STATUS = [
  'offered',
  'accepted',
  'candidate-rejected',
  'recruiter-rejected',
];

const INTERIEW_STATUS = [
  'scheduled',
  'live',
  'completed',
  'rescheduled',
  'cancelled',
];

export const JobApplication = db.define('job_applications', {
  id: {
    type: Sequelize.UUID,
    primaryKey: true,
  },
  job_posting_id: {
    type: Sequelize.UUID,
    references: { model: 'job_postings', key: 'id' },
  },
  portfolio_id: {
    type: Sequelize.UUID,
    references: { model: 'portfolios', key: 'id' },
  },
  review: Sequelize.TEXT,
  status: {
    type: Sequelize.ENUM(...APPLICATION_STATUS),
  },
  assignment_status: {
    type: Sequelize.ENUM(...ASSIGNMENT_STATUS),
  },
  offer_status: {
    type: Sequelize.ENUM(...OFFER_STATUS),
  },
  interview_status: {
    type: Sequelize.ENUM(...INTERIEW_STATUS),
  },
  assignment_due_date: {
    type: Sequelize.DATE,
  },
  assignment_sent_date: {
    type: Sequelize.DATE,
  },
  interview_date: {
    type: Sequelize.DATE,
  },
  offer_details: Sequelize.JSON,
  applicant_feedback: Sequelize.TEXT,
  counsellor_notes: Sequelize.TEXT,
});

export default JobApplication;
