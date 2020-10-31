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
    console.log(jobPosting);
    let logo = await getViewUrlS3(jobPosting.logo, '', 'company_logo');
    jobPosting.logo = logo;
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
    return jobPosting;
  });

export const getAllJobPostings = (
  limit = 10,
  offset = 0,
  status,
  company_id,
) => JobPosting.findAndCountAll(
  {
    where: { status, company_id },
    include: [{
      model: CompanyProfile,
      attributes: ['name', 'logo'],
    }],
    offset,
    limit,
  },
);

export const getJobPostingsByStatus = (
  status = 'active',
  limit = 10,
  offset = 0,
) => JobPosting.findAndCountAll(
  {
    where: { status },
    include: [{
      model: CompanyProfile,
      attributes: ['name', 'logo'],
    }],
    offset,
    limit,
  },
);

export const getJobPostingsByCompany = (
  company_id,
  status = 'active',
  limit = 10,
  offset = 0,
) => JobPosting.findAndCountAll(
  {
    where: {
      status,
      company_id,
    },
    include: [{
      model: CompanyProfile,
      attributes: ['name', 'logo'],
    }],
    offset,
    limit,
  },
);

export const createJobPosting = (
  company_id,
  description,
  tags,
  status = 'active',
  posted_by,
) => JobPosting.create(
  {
    company_id,
    description,
    tags,
    status,
    created_at: new Date(),
    posted_by,
  },
);

export const updateJobPostingById = (
  id,
  company_id,
  description,
  tags,
  status,
  posted_by,
) => JobPosting.findOne({
  where: {
    id,
  },
})
  .then((jobPosting) => {
    if (_.isEmpty(jobPosting)) {
      return JobPosting.create({
        company_id,
        description,
        tags,
        status,
        posted_by,
      });
    }

    jobPosting.posted_by.push(...posted_by);

    return JobPosting.update({
      company_id,
      description,
      tags,
      status,
      posted_by: jobPosting.posted_by,
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
