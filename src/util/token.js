import {USER_ROLES} from '../models/user';
import AUTH_SCOPES from './authScopes';
import jwt from 'jsonwebtoken';

const getScope = user => {
  switch(user.role) {
    case USER_ROLES.EDUCATOR: return AUTH_SCOPES.EDUCATOR;
    case USER_ROLES.SUPERADMIN: return AUTH_SCOPES.ALL;
    default: return AUTH_SCOPES.STUDENT;
  }
}

export const getSoalToken = (user, githubToken=null) => jwt.sign({
  user: user._id,
  githubToken,
  scope: getScope(user),
}, process.env.JWT_SECRET);


export const getFakeToken = () => {
  const fakeAdmin = {
    _id: '234932498',
    role: USER_ROLES.SUPERADMIN,
  }
  return getSoalToken(fakeAdmin);
}
