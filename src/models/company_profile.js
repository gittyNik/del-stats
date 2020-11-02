import Sequelize from 'sequelize';
import _ from 'lodash';
import db from '../database';
import { getViewUrlS3 } from '../controllers/firewall/documents.controller';
import { USER_ROLES } from './user';

const {
  LEARNER,
} = USER_ROLES;

const STATUS = [
  'active',
  'removed',
];

export const CompanyProfile = db.define('company_profiles', {
  id: {
    type: Sequelize.UUID,
    defaultValue: Sequelize.UUIDV4,
    primaryKey: true,
  },
  name: Sequelize.STRING,
  description: Sequelize.TEXT,
  logo: {
    type: Sequelize.STRING,
  },
  website: {
    type: Sequelize.STRING,
  },
  worklife: {
    type: Sequelize.TEXT,
  },
  perks: {
    type: Sequelize.TEXT,
  },
  views: {
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
  locations: Sequelize.ARRAY(Sequelize.STRING),
  recruiters: Sequelize.ARRAY(Sequelize.UUID),
  updated_by: Sequelize.ARRAY(Sequelize.JSON),
  status: {
    type: Sequelize.ENUM(...STATUS),
    defaultValue: 'active',
  },
  level_of_candidates: Sequelize.ARRAY(Sequelize.STRING),
  roles: Sequelize.ARRAY(Sequelize.STRING),
});

export const getCompanyProfileFromRecruiterId = (id, role) => CompanyProfile.findOne({
  where: {
    recruiters: { [Sequelize.Op.contains]: [id] },
  },
  raw: true,
}).then(async (companyProfile) => {
  if (companyProfile.logo) {
    let logo = await getViewUrlS3(companyProfile.logo, '', 'company_logo');
    companyProfile.logo = logo.signedRequest;
  }
  if ((companyProfile) && (role === LEARNER)) {
    let views = 1;
    views += companyProfile.views;
    CompanyProfile.update({
      views,
    }, {
      where: {
        id,
      },
    });
  }
  return companyProfile;
});

export const getCompanyProfileFromId = (id, role) => CompanyProfile.findOne({
  where: {
    id,
  },
  raw: true,
}).then(async (companyProfile) => {
  if (companyProfile.logo) {
    let logo = await getViewUrlS3(companyProfile.logo, '', 'company_logo');
    companyProfile.logo = logo.signedRequest;
  }
  if ((companyProfile) && (role === LEARNER)) {
    let views = 1;
    views += companyProfile.views;
    CompanyProfile.update({
      views,
    }, {
      where: {
        id,
      },
    });
  }
  return companyProfile;
});

export const getAllCompanyProfiles = (
  limit = 10,
  offset = 0,
  status = 'active',
) => CompanyProfile.findAndCountAll(
  {
    where: { status },
    offset,
    limit,
  },
);

export const createCompanyProfile = (
  name,
  description,
  logo,
  website,
  worklife,
  perks,
  tags,
  recruiters,
  updated_by,
  locations,
  level_of_candidates,
  roles,
) => CompanyProfile.create(
  {
    name,
    description,
    logo,
    website,
    worklife,
    perks,
    tags,
    recruiters,
    locations,
    updated_by,
    level_of_candidates,
    roles,
    created_at: new Date(),
  },
);

export const updateCompanyProfileById = (
  id,
  name,
  description,
  logo,
  website,
  worklife,
  perks,
  tags,
  recruiters,
  updated_by,
  locations,
  level_of_candidates,
  roles,
) => CompanyProfile.findOne({
  where: {
    id,
  },
})
  .then((companyProfile) => {
    if (_.isEmpty(companyProfile)) {
      throw Error('Company does not exist!');
    }

    companyProfile.updated_by.push(...updated_by);

    return CompanyProfile.update({
      name,
      description,
      logo,
      website,
      worklife,
      perks,
      tags,
      recruiters,
      locations,
      level_of_candidates,
      roles,
      updated_by: companyProfile.updated_by,
    }, {
      where: {
        id,
      },
    });
  });

export const addRecruiterToCompany = (
  id,
  recruiter_id,
  updated_by,
) => CompanyProfile.findOne({
  where: {
    id,
  },
})
  .then((companyProfile) => {
    if (_.isEmpty(companyProfile)) {
      throw Error('Company does not exist!');
    }

    companyProfile.recruiters.push(recruiter_id);
    companyProfile.updated_by.push(...updated_by);

    return CompanyProfile.update({
      recruiters: companyProfile.recruiters,
      updated_by: companyProfile.updated_by,
    }, {
      where: {
        id,
      },
    });
  });

export const removeCompanyProfile = (id, updated_by) => CompanyProfile.findOne({
  where: {
    id,
  },
})
  .then((companyProfile) => {
    if (_.isEmpty(companyProfile)) {
      throw Error('Job does not exist!');
    }

    companyProfile.updated_by.push(...updated_by);

    return CompanyProfile.update({
      status: 'removed',
      updated_by: companyProfile.updated_by,
    }, {
      where: {
        id,
      },
    });
  });

export default CompanyProfile;
