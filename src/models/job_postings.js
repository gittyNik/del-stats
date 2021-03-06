import Sequelize from 'sequelize';
import _ from 'lodash';
import db from '../database';
import { USER_ROLES } from './user';
import { sendPathDetails } from '../util/file-fetcher';
import { CompanyProfile } from './company_profile';
import { Challenge } from './challenge';

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

const { cdn, basePath } = sendPathDetails('company_logo');

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
  start_range: {
    type: Sequelize.FLOAT,
  },
  end_range: {
    type: Sequelize.FLOAT,
  },
  job_type: Sequelize.ENUM(...JOB_TYPE),
  locations: Sequelize.ARRAY(Sequelize.STRING),
  experience_required: Sequelize.STRING,
  default_assignment: {
    type: Sequelize.UUID,
    references: { model: 'challenges', key: 'id' },
  },
  attached_assignments: {
    type: Sequelize.ARRAY({
      type: Sequelize.UUID,
      references: { model: 'challenges', key: 'id' },
    }),
  },
});

export const getJobPostingFromId = (id, role,
  assignment = false, job_details = true) => {
  let includeArray = [{
    model: CompanyProfile,
    attributes: ['name', 'logo'],
  }];
  let attributesArray;
  if (assignment) {
    includeArray.push({
      model: Challenge,
    });
  }
  if (job_details === 'false') {
    attributesArray = { exclude: ['description'] };
  }
  return JobPosting.findOne({
    where: {
      id,
    },
    include: includeArray,
    attributes: attributesArray,
  })
    .then(async (jobPosting) => {
      if (jobPosting) {
        if (jobPosting.logo) {
          let logo = `${cdn}${basePath}/${jobPosting.logo}`;
          jobPosting.logo = logo;
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
};

export const getAllJobPostings = ({
  limit,
  offset,
  status,
  company_id,
}) => {
  limit = limit || 50;
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
        attributes: ['name', [Sequelize.fn('concat', cdn, basePath, '/', Sequelize.col('logo')), 'logo'],
          'website', 'level_of_candidates'],
      },
      {
        model: Challenge,
      },
      ],
      offset,
      limit,
      order: [
        ['updated_at', 'DESC'],
      ],
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
  limit = limit || 50;
  status = status || 'active';
  let whereObj = { status };
  return JobPosting.findAndCountAll(
    {
      where: whereObj,
      include: [{
        model: CompanyProfile,
        attributes: ['name', [Sequelize.fn('concat', cdn, basePath, '/', Sequelize.col('logo')), 'logoUrl']],
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
  limit = limit || 50;
  status = status || 'active';
  sendPathDetails();
  let whereObj = { status };
  if (company_id) {
    whereObj.company_id = company_id;
  }
  return JobPosting.findAndCountAll(
    {
      where: whereObj,
      include: [{
        model: CompanyProfile,
        attributes: ['name', [Sequelize.fn('concat', cdn, basePath, '/', Sequelize.col('logo')), 'logo']],
      },
      {
        model: Challenge,
      }],
      offset,
      limit,
    },
  );
};

export const createJobPosting = ({

  company_id,
  description,
  tags,
  status = 'active',
  posted_by,
  vacancies,
  start_range,
  end_range,
  job_type,
  locations,
  experience_required,
  title,
  default_assignment,
  attached_assignments,
}) => JobPosting.create(
  {
    company_id,
    description,
    tags,
    status,
    created_at: new Date(),
    posted_by,
    vacancies,
    start_range,
    end_range,
    job_type,
    locations,
    experience_required,
    title,
    default_assignment,
    attached_assignments,
  },
);

export const updateJobPostingById = ({

  id,
  company_id,
  description,
  tags,
  status,
  posted_by,
  vacancies,
  start_range,
  end_range,
  job_type,
  locations,
  experience_required,
  title,
  default_assignment,
  attached_assignments,
}) => JobPosting.findOne({
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
      start_range,
      end_range,
      job_type,
      locations,
      experience_required,
      title,
      default_assignment,
      attached_assignments,
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
