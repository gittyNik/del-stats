import Sequelize from 'sequelize';
import uuid from 'uuid/v4';
import _ from 'lodash';
import db from '../database';

const { DEFAULT_USER } = process.env;

export const USER_ROLES = Object.freeze({
  LEARNER: 'learner',
  EDUCATOR: 'educator',
  ENABLER: 'enabler',
  CATALYST: 'catalyst',
  ADMIN: 'admin',
  GUEST: 'guest',
  SUPERADMIN: 'superadmin',
  REVIEWER: 'reviewer',
  OPERATIONS: 'operations',
  RECRUITER: 'recruiter',
});

const AVAILABLE_USER_STATUS = [
  'medical emergency',
  'dropout',
  'moved',
  'respawning core phase',
  'respawning focus phase',
  'irregular',
  'focus phase',
  'core phase',
  'frontend',
  'backend',
  'admission terminated',
  'long leave',
  'joining later',
  'prefers hindi',
  'back after absence',
  'other',
];

export const User = db.define(
  'users',
  {
    name: Sequelize.STRING,
    email: Sequelize.STRING,
    phone: Sequelize.STRING,
    role: Sequelize.STRING,
    location: Sequelize.STRING,
    profile: Sequelize.JSON,
    // USER status should have the status and date when
    // it was reported
    status: {
      type: Sequelize.ARRAY(Sequelize.STRING),
      defaultValue: [],
    },
    status_reason: {
      type: Sequelize.ARRAY(Sequelize.JSON),
      defaultValue: [],
    },
  },
  {},
);

export const getUserName = id => User.findByPk(id, {
  attributes: ['name', 'status'],
  raw: true,
});

export const getProfile = id => User.findOne(
  {
    where: {
      id,
    },
  },
  { raw: true },
);

export const getUserByEmail = email => User.findOne(
  {
    where: {
      email,
    },
  },
  { raw: true },
);

export const getUsersWithStatus = (status, learner_ids) => User.findAll({
  where: {
    id: {
      [Sequelize.Op.in]: learner_ids,
    },
    status,
  },
  raw: true,
});

export const updateUserData = (id, phone, email, location, profile) => User.findOne({
  where: {
    id,
  },
})
  .then((userStatus) => {
    if (_.isEmpty(userStatus)) {
      throw Error('User does not exist');
    }

    let mergedUserDetails = { ...profile, ...userStatus.profile };
    return userStatus.update({
      profile: mergedUserDetails,
      phone,
      email,
      location,
    }, {
      where: {
        id,
      },
    });
  });

export const getUserFromEmails = emails => User.findOne(
  {
    where: {
      email: { [Sequelize.Op.in]: emails },
    },
  },
  { raw: true },
);

export const getOrCreateUser = phone => User.findOrCreate({
  where: {
    phone,
  },
  defaults: {
    id: uuid(),
    role: USER_ROLES.GUEST,
  },
});

export const createUser = (user, role = USER_ROLES.GUEST) => User.create({
  id: uuid(),
  role,
  ...user,
});

export const getUserFromPhone = phone => User.findOne(
  {
    where: {
      phone,
    },
    // attributes: ['name', 'phone'],
  },
  { raw: true },
);

export const createSuperAdmin = () => User.findOrCreate({
  where: {
    email: DEFAULT_USER,
    role: USER_ROLES.SUPERADMIN,
  },
  raw: true,
  defaults: {
    id: uuid(),
  },
});

export const removeUserStatus = (
  id, existing_status, status_reason, updated_by_id, updated_by_name, milestone_id, milestone_name,
  cohort_id, cohort_name,
) => User.findOne({
  where: {
    id,
  },
}).then((userStatus) => {
  if (_.isEmpty(userStatus)) {
    throw Error('User does not exist');
  }
  const removeIndex = userStatus.status.indexOf(existing_status);
  if (removeIndex === -1) {
    throw Error('User status does not exist');
  } else {
    userStatus.status.splice(removeIndex, 1);

    let statusDetails = {
      status_reason,
      removed_status: existing_status,
      date: new Date(),
      updated_by: { id: updated_by_id, name: updated_by_name },
    };

    if ((milestone_id) && (milestone_name)) {
      statusDetails.milestone = { id: milestone_id, name: milestone_name };
    }
    if ((cohort_id) && (cohort_name)) {
      statusDetails.cohort = { id: cohort_id, name: cohort_name };
    }

    userStatus.status_reason.push(statusDetails);

    return User.update({
      status_reason: userStatus.status_reason,
      status: userStatus.status,
    }, {
      where: {
        id,
      },
      returning: true,
      raw: true,
    });
  }
});

export const addUserStatus = (
  id, status, status_reason, updated_by_id, updated_by_name, milestone_id, milestone_name,
  cohort_id, cohort_name,
) => {
  if (AVAILABLE_USER_STATUS.indexOf(status) > -1) {
    return User.findOne({
      where: {
        id,
      },
    })
      .then((userStatus) => {
        if (_.isEmpty(userStatus)) {
          throw Error('User does not exist');
        }

        let statusDetails = {
          status_reason,
          status,
          date: new Date(),
          updated_by: { id: updated_by_id, name: updated_by_name },
        };

        if ((milestone_id) && (milestone_name)) {
          statusDetails.milestone = { id: milestone_id, name: milestone_name };
        }
        if ((cohort_id) && (cohort_name)) {
          statusDetails.cohort = { id: cohort_id, name: cohort_name };
        }

        userStatus.status_reason.push(statusDetails);
        userStatus.status.push(status);
        return User.update({
          status_reason: userStatus.status_reason,
          status: userStatus.status,
        }, {
          where: {
            id,
          },
          returning: true,
          raw: true,
        });
      });
  }
  throw Error('Status not valid');
};

export const changeUserRole = (learner_id, role) => User.update({
  role,
}, {
  where: {
    id: learner_id,
  },
});
