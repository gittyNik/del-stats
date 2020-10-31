import Sequelize from 'sequelize';
import { apiNotReady } from '../api.controller';
import {
  User, USER_ROLES, addUserStatus, updateUserData,
  removeUserStatus, addProfilePicture,
} from '../../models/user';
import {
  belowThresholdLearners,
} from '../../models/team';
import {
  getCohortFromId,
} from '../../models/cohort';
import { createOrUpdateContact } from '../../integrations/hubspot/controllers/contacts.controller';
import { createDeal, associateDealWithContact } from '../../integrations/hubspot/controllers/deals.controller';

const {
  CATALYST, EDUCATOR, ADMIN, SUPERADMIN, REVIEWER,
} = USER_ROLES;

export const getProfile = (req, res) => {
  res.json({ user: req.jwtData.user });
};

export const updateUser = (req, res) => {
  let {
    phone, email, location, profile,
  } = req.body;
  let { id } = req.params;
  updateUserData(id, phone, email, location, profile).then(data => {
    res.json({
      text: 'Update user',
      data,
    });
  }).catch(err => {
    console.error(err);
    res.sendStatus(500);
  });
};

export const updateProfile = (req, res) => {
  const { id, phone } = req.jwtData.user;
  const {
    email, firstName, lastName, name, location, profile, hubspot,
  } = req.body;
  const { gender, birthDate } = profile;
  const {
    knowAboutSOALFrom,
    occupationBeforeSOAL,
    program,
    format,
    preferredCampus,
    cohortStartDate,
    equippedWithLaptop,
    comfortableWithEnglish,
    stableInternetConnectivity,
    exclusivelyAvailableForProgram,
    availableForJob,
  } = hubspot;
  createOrUpdateContact({
    email,
    phone,
    firstName,
    lastName,
    location,
    gender,
    knowAboutSOALFrom,
    occupationBeforeSOAL,
    birthDate,
    equippedWithLaptop,
    comfortableWithEnglish,
    stableInternetConnectivity,
    exclusivelyAvailableForProgram,
    availableForJob,
  }).then(result => {
    createDeal({
      name,
      email,
      phone,
      program,
      format,
      preferredCampus,
      cohortStartDate,
      applicantStatus: 'Applicant',
    })
      .then(deal => {
        const { dealId } = deal;
        const contactId = result.vid;
        associateDealWithContact(dealId, contactId)
          .then(() => {
            profile.hubspotDealId = dealId;
            User.update({
              email, name, location, profile,
            }, {
              where: { id },
              returning: true,
              raw: true,
            })
              .then(result => result[1][0])
              .then(data => {
                res.send({
                  data,
                  text: 'Update success',
                });
              })
              .catch(err => {
                console.error(err);
                res.sendStatus(500);
              });
          });
      }).catch(err => {
        console.error(err);
        res.sendStatus(500);
      });
  }).catch(err => {
    console.error(err);
    res.sendStatus(500);
  });
};

export const getEducators = (req, res) => {
  User.findAll({
    where: {
      role: {
        [Sequelize.Op.in]: [CATALYST, EDUCATOR, ADMIN, SUPERADMIN, REVIEWER],
      },
    },
  }).then(data => {
    res.json({
      text: 'Teaching users',
      data,
    });
  }).catch(err => {
    console.error(err);
    res.sendStatus(500);
  });
};

export const removeUserStatusApi = (req, res) => {
  let {
    user_id, status, reason, milestone_id, milestone_name,
    cohort_id, cohort_name,
  } = req.body;
  let { id, name } = req.jwtData.user;

  removeUserStatus(user_id, status, reason, id, name,
    milestone_id, milestone_name,
    cohort_id, cohort_name).then(data => {
    res.json({
      text: `Removed User status: ${status}`,
      data,
    });
  }).catch(err => {
    console.error(err);
    res.sendStatus(500);
  });
};

export const updateUserStatus = (req, res) => {
  let {
    user_id, status, reason, milestone_id, milestone_name,
    cohort_id, cohort_name,
  } = req.body;
  let { id, name } = req.jwtData.user;

  addUserStatus(user_id, status, reason, id, name,
    milestone_id, milestone_name,
    cohort_id, cohort_name).then(data => {
    res.json({
      text: 'Added User status',
      data,
    });
  }).catch(err => {
    console.error(err);
    res.sendStatus(500);
  });
};

export const leastAttendanceInCohort = async (req, res) => {
  let {
    cohort_id,
  } = req.body;
  let cohortDetails = await getCohortFromId(cohort_id);
  belowThresholdLearners(cohortDetails.learners).then(data => {
    res.json({
      text: 'Cohort least attendees',
      data,
    });
  }).catch(err => {
    console.error(err);
    res.sendStatus(500);
  });
};

export const addProfilePictureAPI = async (req, res) => {
  const { user, action } = req.body;
  try {
    const data = await addProfilePicture(user, action);
    res.status(200).json({
      text: 'signedUrl for uploading profile picture',
      data,
      type: 'success',
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      text: 'Failed to create signedUrl for uploading profile picture',
      type: 'failure',
    });
  }
};
