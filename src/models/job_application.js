import Sequelize from 'sequelize';
import { v4 as uuid } from 'uuid';
import { Portfolio, updatePortfolioStatus } from './portfolio';
import db from '../database';
import { JobPosting } from './job_postings';
import {
  learnerChallengesFindOrCreate,
  LearnerChallenge,
} from './learner_challenge';
import { LearnerInterviews } from './learner_interviews';
import { CompanyProfile } from './company_profile';
import { getViewUrlS3 } from '../util/file-fetcher';
import logger from '../util/logger';

const APPLICATION_STATUS = [
  'active',
  'assignment',
  'interview',
  'shortlisted',
  'hired',
  'rejected',
  'closed',
  'shortlisted-by-soal',
  'interested',
  'offered',
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
  'soal-rejected',
  '',
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
    defaultValue: 'active',
  },
  attached_assignment: {
    type: Sequelize.UUID,
    references: { model: 'challenges', key: 'id' },
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
  created_at: {
    type: Sequelize.DATE,
  },
  updated_at: {
    type: Sequelize.DATE,
  },
  updated_by: Sequelize.ARRAY(Sequelize.JSON),
});

export const getAllJobApplications = ({ limit, offset }) => {
  // default parameters
  limit = limit || 30;

  return JobApplication
    .findAndCountAll({
      include: [{
        model: Portfolio,
      },
      {
        model: JobPosting,
        attributes: ['title', 'company_id', 'job_type'],
      },
      {
        model: LearnerInterviews,
        as: 'LearnerInterviewsDetails',
      },
      ],
      limit,
      offset,
      // raw: true,
    });
};

export const getJobApplicationsByCompany = ({
  company_id, status, limit, offset,
}) => {
  limit = limit || 30;

  let whereObj = {
    '$job_posting.company_id$': company_id,
  };
  if (status) {
    whereObj.status = status;
  }

  return JobApplication.findAndCountAll({
    include: [{
      model: Portfolio,
      attributes: ['learner_id', 'id', 'status', 'hiring_status'],
    },
    {
      model: JobPosting,
      attributes: ['title', 'company_id', 'job_type'],
    },
    {
      model: LearnerInterviews,
      as: 'LearnerInterviewsDetails',
      required: false,
    },
    {
      model: LearnerChallenge,
      as: 'ApplicationChallenges',
    },
    ],
    where: whereObj,
    raw: true,
    limit,
    offset,
  });
};

export const getJobApplicationsForLearnerId = async ({
  learner_id, status, limit, offset,
}) => {
  limit = limit || 30;
  let whereObj = {
    '$portfolio.learner_id$': learner_id,
  };

  if (status) {
    whereObj.status = status;
  }

  const { count, rows: jobApplications } = await JobApplication.findAndCountAll({
    include: [{
      model: Portfolio,
      attributes: ['learner_id', 'id', 'status', 'hiring_status'],
    },
    {
      model: JobPosting,
      attributes: [
        'title', 'company_id', 'job_type', 'views',
        'interested', 'vacancies', 'tags', 'locations',
        'experience_required', 'default_assignment', 'attached_assignments',
      ],
      include: [{
        model: CompanyProfile,
        attributes: ['name', 'logo'],
      }],
    },
    {
      model: LearnerInterviews,
      as: 'LearnerInterviewsDetails',
    },
    {
      model: LearnerChallenge,
      as: 'ApplicationChallenges',
    },
    ],
    where: whereObj,
    raw: true,
    limit,
    offset,
  });
  const learnerJobs = await Promise.all(jobApplications.map(async jobApplication => {
    if (jobApplication['job_posting.company_profile.logo']) {
      let logo = await getViewUrlS3(jobApplication['job_posting.company_profile.logo'], 'company_logo');
      jobApplication['job_posting.company_profile.logo'] = logo;
    }
    return jobApplication;
  }));
  return {
    count,
    learnerJobs,
  };
};

export const getJobApplication = (id) => JobApplication
  .findOne({
    where: { id },
    include: [
      {
        model: Portfolio,
        attributes: ['learner_id', 'id', 'status', 'hiring_status'],
      },
      {
        model: JobPosting,
        attributes: ['title', 'company_id', 'job_type'],
      },
      {
        model: LearnerInterviews,
        as: 'LearnerInterviewsDetails',
        required: false,
      },
      {
        model: LearnerChallenge,
        as: 'ApplicationChallenges',
      },
    ],
    raw: true,
  });

export const createJobApplication = ({
  job_posting_id, portfolio_id, assignment_due_date,
  status, attached_assignment,
}) => {
  if (status === 'assignment') {
    return JobApplication.create({
      id: uuid(),
      job_posting_id,
      portfolio_id,
      status,
      assignment_status: 'sent',
      assignment_due_date,
      attached_assignment,
      assignment_sent_date: Sequelize.literal('NOW()'),
      created_at: Sequelize.literal('NOW()'),
      updated_at: Sequelize.literal('NOW()'),
    });
  }
  return JobApplication.create({
    id: uuid(),
    job_posting_id,
    portfolio_id,
    status,
    created_at: Sequelize.literal('NOW()'),
    updated_at: Sequelize.literal('NOW()'),
  });
};

export const createJobApplicationForPortofolio = async (
  {
    job_posting_id, portfolio_id, learner_id,
    assignment_id, assignment_due_date,
  },
) => {
  // Create Learner challenge if application does not exist
  let checkExisting = await JobApplication.findOne({
    where: {
      job_posting_id, portfolio_id,
    },
    raw: true,
  });
  if (checkExisting) {
    return checkExisting;
  }
  let jobApplication = await createJobApplication(
    {
      job_posting_id,
      portfolio_id,
      assignment_due_date,
      attached_assignment: assignment_id,
    },
  );
  // await updateLearnerChallenge(challengeDetails.challenge.id, jobApplication.id);
  return jobApplication;
};

export const updateJobApplication = async ({
  id, job_posting_id, portfolio_id, review, status,
  assignment_status, offer_status,
  interview_status, assignment_due_date, interview_date,
  offer_details, applicant_feedback, counsellor_notes, assignment_id,
  learner_id, updated_by,
}) => {
  let learnerAssignment;
  if ((assignment_id) && (assignment_status === 'started')) {
    learnerAssignment = await learnerChallengesFindOrCreate(
      assignment_id,
      learner_id,
      false,
      id,
    );
  }

  if (offer_status === 'accepted') {
    await updatePortfolioStatus(portfolio_id, 'hired', updated_by);
  }

  return JobApplication.findOne({
    where: {
      id,
    },
  })
    .then(async (learnerJobApplication) => {
      if (learnerJobApplication.updated_by === null) {
        learnerJobApplication.updated_by = [];
      }
      learnerJobApplication.updated_by.push(...updated_by);

      let jobApplication = await JobApplication.update({
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
        attached_assignment: assignment_id,
        updated_by: learnerJobApplication.updated_by,
      }, {
        where: { id },
        returning: true,
        raw: true,
      });
      jobApplication[1][0].learnerAssignment = learnerAssignment;
      return jobApplication[1][0];
    });
};

export const updateJobApplicationBypass = (application, id) => JobApplication.update({
  ...application,
}, {
  where: {
    id,
  },
  returning: true,
});

export const deleteJobApplication = (id) => JobApplication
  .destroy({ where: { id } })
  .then(() => { 'Job application deleted.'; })
  .catch(err => {
    logger.error(err);
    return { text: 'Failed to delete Job application' };
  });

export default JobApplication;
