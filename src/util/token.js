import {USER_ROLES} from '../models/user';
import jwt from 'jsonwebtoken';

export const getSoalToken = (user, githubToken=null) => jwt.sign({
  userId: user.id,
  githubToken,
  scope: user.role,
}, process.env.JWT_SECRET);

export const getFakeToken = () => {
  const fakeAdmin = {
    id: '234932498',
    role: USER_ROLES.SUPERADMIN,
  };
  return getSoalToken(fakeAdmin);
}
