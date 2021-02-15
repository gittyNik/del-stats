/*
  Scope and Role are used interchangably here. Please note that they may
  have different meanings in later versions of Delta.
  e.g.
  - An educator's role is EDUCATOR and the scope is TEP_HYD_EDUCATOR
  - An applicant's role is LEARNER but the scope is FIREWALL_LEARNER
*/
import { USER_ROLES } from '../../models/user';

const ERRMSG = 'You do not have access to this data!';

export const allowLearnerWithId = learnerId => (req, res, next) => {
  const { role, id } = req.jwtData.user;
  if (id === learnerId && role === USER_ROLES.LEARNER) {
    next();
  } else {
    res.status(403).send(ERRMSG);
  }
};

const allowRole = (role, errorMessage = ERRMSG) => (req, res, next) => {
  if ((req.jwtData.user && req.jwtData.user.role === role)
    // || (req.jwtData.user && req.jwtData.user.roles.includes(role))
    || (req.jwtData.user.role === USER_ROLES.SUPERADMIN)) {
    next();
  } else {
    res.status(403).send(errorMessage);
  }
};

export const allowMultipleRoles = (roles, errorMessage = ERRMSG) => (req, res, next) => {
  if ((req.jwtData.user && roles.includes(req.jwtData.user.role))
    || (req.jwtData.user && roles.filter(value => req.jwtData.user.roles.includes(value)))
    || (req.jwtData.user.role === USER_ROLES.SUPERADMIN)) {
    next();
  } else {
    res.status(403).send(errorMessage);
  }
};

export const allowSuperAdminOnly = allowRole(
  USER_ROLES.SUPERADMIN,
  'You do not have superadmin privileges!',
);
export const allowLearnersOnly = allowRole(USER_ROLES.LEARNER);
export const allowAdminsOnly = allowRole(USER_ROLES.ADMIN);
export const allowEducatorsOnly = allowRole(USER_ROLES.EDUCATOR);
export const allowCatalystOnly = allowRole(USER_ROLES.CATALYST);
export const allowEnablersOnly = allowRole(USER_ROLES.ENABLER);
