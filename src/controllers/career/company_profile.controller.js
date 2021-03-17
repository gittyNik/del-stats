import {
  getCompanyProfileFromId, getAllCompanyProfiles,
  createCompanyProfile, updateCompanyProfileById,
  removeCompanyProfile, getCompanyProfileFromRecruiterId,
} from '../../models/company_profile';
import logger from '../../util/logger';

export const getAllCompanyProfilesAPI = (req, res) => {
  let {
    limit, page, status,
  } = req.query;
  let offset;
  if ((limit) && (page)) {
    offset = limit * (page - 1);
  }
  getAllCompanyProfiles(limit, offset, status)
    .then(data => res.status(201).json({
      message: 'Company Profiles fetched',
      data,
      type: 'success',
    }))
    .catch(err => {
      logger.error(err);
      res.status(500);
    });
};

export const getCompanyProfileFromIdAPI = (req, res) => {
  const { id } = req.params;
  const { role } = req.jwtData.user;
  getCompanyProfileFromId(id, role)
    .then(data => res.status(201).json({
      message: 'Company Profile fetched',
      data,
      type: 'success',
    }))
    .catch(err => {
      logger.error(err);
      res.status(500);
    });
};

export const getCompanyProfileFromRecruiterIdAPI = (req, res) => {
  const { id, role } = req.jwtData.user;
  getCompanyProfileFromRecruiterId(id, role)
    .then(data => res.status(201).json({
      message: 'Company Profile fetched',
      data,
      type: 'success',
    }))
    .catch(err => {
      logger.error(err);
      res.status(500);
    });
};

export const createCompanyProfileAPI = (req, res) => {
  const {
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
    name_recruiter,
    id_recruiter,
    added_by_recruiter,
  } = req.body;
  let user_name = name_recruiter;
  let recruiter_id = id_recruiter;
  if (added_by_recruiter) {
    recruiter_id = req.jwtData.user.id;
    user_name = req.jwtData.user.name;
  }
  let updated_by = [{
    user_name,
    updated_at: new Date(),
    recruiter_id,
  }];
  createCompanyProfile(
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
  )
    .then((data) => res.status(201).json({
      message: 'Company Profile created',
      data,
      type: 'success',
    }))
    .catch(err => {
      logger.error(err);
      res.status(500);
    });
};

export const updateCompanyProfileByIdAPI = (req, res) => {
  const { id } = req.params;
  const {
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
    name_recruiter,
    id_recruiter,
    added_by_recruiter,
  } = req.body;
  let user_name = name_recruiter;
  let recruiter_id = id_recruiter;
  if (added_by_recruiter) {
    recruiter_id = req.jwtData.user.id;
    user_name = req.jwtData.user.name;
  }
  let updated_by = [{
    user_name,
    updated_at: new Date(),
    recruiter_id,
  }];

  updateCompanyProfileById(
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
  ).then(() => res.status(200).json({
    message: 'Company Profile updated',
    type: 'success',
  }))
    .catch(err => {
      logger.error(err);
      res.status(500);
    });
};

export const removeCompanyProfileAPI = (req, res) => {
  const { id } = req.params;
  const user_name = req.jwtData.user.name;
  const user_id = req.jwtData.user.id;
  let posted_by = [{
    user_name,
    updated_at: new Date(),
    user_id,
  }];

  removeCompanyProfile(
    id,
    posted_by,
  ).then(() => res.status(200).json({
    message: 'Company Profile removed',
    type: 'success',
  }))
    .catch(err => {
      logger.error(err);
      res.status(500);
    });
};
