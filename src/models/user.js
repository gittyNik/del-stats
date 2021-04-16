import Sequelize from 'sequelize';
import { v4 as uuid } from 'uuid';
import _ from 'lodash';
import db from '../database';
import { sendMessageToSlackChannel } from '../integrations/slack/team-app/controllers/milestone.controller';

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
  CAREER_SERVICES: 'career-services',
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
  'graduated',
  'past-learner',
  'other',
  'staged',
  'removed',
  'added-to-cohort',
];

const NOTIFY_SLACK_STATUSES = [
  'respawning core phase',
  'respawning focus phase',
  'long leave',
  'admission terminated',
  'back after absence',
  'irregular',
  'medical emergency',
  'dropout',
  'staged',
  'removed',
  'moved',
  'added-to-cohort',
];

export const User = db.define(
  'users',
  {
    name: Sequelize.STRING,
    email: Sequelize.STRING,
    phone: Sequelize.STRING,
    role: Sequelize.STRING,
    roles: Sequelize.ARRAY(Sequelize.STRING),
    location: Sequelize.STRING,
    profile: Sequelize.JSON,
    picture: Sequelize.STRING,
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

export const getLimitedDetailsOfUser = id => User.findByPk(id, {
  attributes: ['id', 'name', 'email', 'phone', 'status', 'role', 'roles', 'profile', 'picture'],
  raw: true,
});

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
    status: {
      [Sequelize.Op.contains]: [status],
    },
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
    return User.update({
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
    roles: [USER_ROLES.GUEST],
  },
});

export const createUser = (user, role = USER_ROLES.GUEST) => User.create({
  id: uuid(),
  role,
  roles: [role],
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
    roles: [USER_ROLES.SUPERADMIN],
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

export const addUserStatus = ({
  id, status, status_reason, updated_by_id, updated_by_name, milestone_id, milestone_name,
  cohort_id, cohort_name, cohort_milestone_id,
}) => {
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

        try {
          if (NOTIFY_SLACK_STATUSES.indexOf(status) > -1) {
            const message = `*${userStatus.name}* ${userStatus.email} has been marked: *${status}* by ${updated_by_name}`;
            const context = 'Learner status update';
            sendMessageToSlackChannel(message, context, process.env.SLACK_LEARNER_AFFAIRS);
          }
        } catch (err) {
          console.warn('Failed to send slack message');
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
        if (cohort_milestone_id) {
          statusDetails.cohort_milestone_id = cohort_milestone_id;
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

export const changeUserRole = (learner_id, role) => {
  let roles = [role];
  return User.update({
    role,
    roles,
  }, {
    where: {
      id: learner_id,
    },
  });
};

export const addProfilePicture = async ({ user_id, picture_url }) => User.update({
  picture: picture_url,
}, {
  where: {
    id: user_id,
  },
});
