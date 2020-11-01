import Sequelize from 'sequelize';
import uuid from 'uuid/v4';
import { application } from 'express';
import { Portfolio } from './portfolio';
import db from '../database';
import { JobPosting } from './job_postings';
import {
  learnerChallengesFindOrCreate,
  updateLearnerChallenge,
} from './learner_challenge';

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
  applicant_feedback: Sequelize.JSON,
  counsellor_notes: Sequelize.TEXT,
});

export const getAllJobApplications = ({ status, limit, offset }) => {
  // default parameters
  limit = limit || 10;
  status = status || 'active';

  return JobApplication
    .findAndCountAll({
      where: { status },
      // include: [{
      //   association: Portfolio,
      // }],
      limit,
      offset,
      // raw: true,
    });
};

export const getJobApplicationsByCompany = ({
  company_id, status, limit, offset,
}) => {
  limit = limit || 10;
  status = status || 'active';

  return JobApplication.findAndCountAll({
    where: { status },
    inlcude: [{
      association: JobPosting,
      include: [{
        where: { id: company_id },
        // attributes: []
      }],
    }],
    limit,
    offset,
  });
};

export const getJobApplicationsForLearnerId = ({
  learner_id, status, limit, offset,
}) => {
  limit = limit || 10;
  status = status || 'active';

  return JobApplication.findAndCountAll({
    where: { status },
    include: [{
      association: Portfolio,
      where: {
        learner_id,
      },
    }],
    limit,
    offset,
  });
};

export const getJobApplication = (id) => JobApplication
  .findOne({ where: { id }, raw: true });

export const createJobApplication = ({
  job_posting_id, portfolio_id, assignment_due_date,
}) => JobApplication.create({
  id: uuid(),
  job_posting_id,
  portfolio_id,
  status: 'assignment',
  assignment_status: 'sent',
  assignment_due_date,
  assignment_sent_date: Sequelize.literal('NOW()'),
});

export const createJobApplicationForPortofolio = async (
  {
    job_posting_id, portfolio_id, learner_id,
    assignment_id, assignment_due_date,
  },
) => {
  // Create Learner challenge
  let challengeDetails = await learnerChallengesFindOrCreate(
    assignment_id,
    learner_id,
    false,
  );

  let jobApplication = await createJobApplication(
    job_posting_id, portfolio_id, assignment_due_date,
  );
  await updateLearnerChallenge(challengeDetails.id, jobApplication);
  return jobApplication;
};

export const updateJobApplication = ({
  id, job_posting_id, portfolio_id, review, status,
  assignment_status, offer_status,
  interview_status, assignment_due_date, interview_date,
  offer_details, applicant_feedback, counsellor_notes,
}) => JobApplication.update({
  job_posting_id,
  portfolio_id,
  review,
  status,
  assignment_status,
  offer_status,
  interview_status,
  assignment_due_date,
  interview_date,
  offer_details,
  applicant_feedback,
  counsellor_notes,
}, {
  where: { id },
});

export const deleteJobApplication = (id) => JobApplication
  .destroy({ where: { id } })
  .then(() => { 'Job application deleted.'; })
  .catch(err => {
    console.error(err);
    return { text: 'Failed to delete Job application' };
  });

export default JobApplication;
