import Sequelize from 'sequelize';
import _ from 'lodash';
import db from '../database';
import { USER_ROLES } from './user';
import { getViewUrlS3 } from '../controllers/firewall/documents.controller';
import { CompanyProfile } from './company_profile';

const {
  LEARNER,
} = USER_ROLES;

const STATUS = [
  'active',
  'closed',
  'removed',
  'filled',
  'partially-filled',
];

const JOB_TYPE = ['internship', 'fulltime', 'intern2hire'];

export const JobPosting = db.define('job_postings', {
  id: {
    type: Sequelize.UUID,
    defaultValue: Sequelize.UUIDV4,
    primaryKey: true,
  },
  title: Sequelize.STRING,
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
  vacancies: {
    type: Sequelize.INTEGER,
  },
  attached_assignment: {
    type: Sequelize.UUID,
    references: { model: 'challenges', key: 'id' },
  },
  start_range: {
    type: Sequelize.INTEGER,
  },
  end_range: {
    type: Sequelize.INTEGER,
  },
  job_type: Sequelize.ENUM(...JOB_TYPE),
  locations: Sequelize.ARRAY(Sequelize.STRING),
  experience_required: Sequelize.STRING,
});

export const getJobPostingFromId = (id, role) => JobPosting.findOne({
  where: {
    id,
  },
  include: [{
    model: CompanyProfile,
    attributes: ['name', 'logo'],
  }],
})
  .then(async (jobPosting) => {
    if (jobPosting) {
      if (jobPosting.logo) {
        let logo = await getViewUrlS3(jobPosting.logo, '', 'company_logo');
        jobPosting.logo = logo.signedRequest;
      }
      if ((jobPosting) && (role === LEARNER)) {
        let views = 1;
        views += jobPosting.views;
        JobPosting.update({
          views,
        }, {
          where: {
            id,
          },
        });
      }
    }
    return jobPosting;
  });

export const getAllJobPostings = ({
  limit,
  offset,
  status,
  company_id,
}) => {
  limit = limit || 10;
  status = status || 'active';
  let whereObj = { status };
  if (company_id) {
    whereObj.company_id = company_id;
  }
  return JobPosting.findAndCountAll(
    {
      whereObj,
      include: [{
        model: CompanyProfile,
        attributes: ['name', 'logo'],
      }],
      offset,
      limit,
    },
  );
};

export const getJobPostingsByStatus = (
  {
    limit,
    offset,
    status,
  },
) => {
  limit = limit || 10;
  status = status || 'active';
  let whereObj = { status };
  return JobPosting.findAndCountAll(
    {
      whereObj,
      include: [{
        model: CompanyProfile,
        attributes: ['name', 'logo'],
      }],
      offset,
      limit,
    },
  );
};

export const getJobPostingsByCompany = (
  {
    company_id,
    status,
    limit,
    offset,
  },
) => {
  limit = limit || 10;
  status = status || 'active';
  let whereObj = { status };
  if (company_id) {
    whereObj.company_id = company_id;
  }
  return JobPosting.findAndCountAll(
    {
      whereObj,
      include: [{
        model: CompanyProfile,
        attributes: ['name', 'logo'],
      }],
      offset,
      limit,
    },
  );
};

export const createJobPosting = (
  company_id,
  description,
  tags,
  status = 'active',
  posted_by,
  vacancies,
  attached_assignment,
  start_range,
  end_range,
  job_type,
  locations,
  experience_required,
  title,
) => JobPosting.create(
  {
    company_id,
    description,
    tags,
    status,
    created_at: new Date(),
    posted_by,
    vacancies,
    attached_assignment,
    start_range,
    end_range,
    job_type,
    locations,
    experience_required,
    title,
  },
);

export const updateJobPostingById = (
  id,
  company_id,
  description,
  tags,
  status,
  posted_by,
  vacancies,
  attached_assignment,
  start_range,
  end_range,
  job_type,
  locations,
  experience_required,
  title,
) => JobPosting.findOne({
  where: {
    id,
  },
})
  .then((jobPosting) => {
    if (_.isEmpty(jobPosting)) {
      throw Error('Job does not exist!');
    }

    jobPosting.posted_by.push(...posted_by);

    return JobPosting.update({
      company_id,
      description,
      tags,
      status,
      posted_by: jobPosting.posted_by,
      vacancies,
      attached_assignment,
      start_range,
      end_range,
      job_type,
      locations,
      experience_required,
      title,
    }, {
      where: {
        id,
      },
    });
  });

export const removeJobPosting = (id, posted_by) => JobPosting.findOne({
  where: {
    id,
  },
})
  .then((jobPosting) => {
    if (_.isEmpty(jobPosting)) {
      throw Error('Job does not exist!');
    }

    jobPosting.posted_by.push(...posted_by);

    return JobPosting.update({
      status: 'removed',
      posted_by: jobPosting.posted_by,
    }, {
      where: {
        id,
      },
    });
  });

export default JobPosting;
