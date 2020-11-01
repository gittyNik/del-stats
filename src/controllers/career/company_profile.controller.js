import {
  getCompanyProfileFromId, getAllCompanyProfiles,
  createCompanyProfile, updateCompanyProfileById,
  removeCompanyProfile,
} from '../../models/company_profile';

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
      console.error(err.stack);
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
      console.error(err.stack);
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
  } = req.body;
  const user_name = req.jwtData.user.name;
  const recruiter_id = req.jwtData.user.id;
  let updated_by = [{
    user_name,
    updated_at: new Date(),
    user_id: recruiter_id,
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
      console.error(err.stack);
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
  } = req.body;
  const user_name = req.jwtData.user.name;
  const user_id = req.jwtData.user.id;
  let updated_by = [{
    user_name,
    updated_at: new Date(),
    user_id,
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
      console.error(err.stack);
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
      console.error(err.stack);
      res.status(500);
    });
};
