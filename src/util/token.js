import jwt from 'jsonwebtoken';
import { USER_ROLES } from '../models/user';

export const getSoalToken = (user, githubToken = null) => jwt.sign({
  userId: user.id,
  githubToken,
  scope: user.role,
}, process.env.JWT_SECRET, {
  expiresIn: process.env.JWT_EXPIRES_IN,
});

export const getFakeToken = () => {
  const fakeAdmin = {
    id: '234932498',
    role: USER_ROLES.SUPERADMIN,
  };
  return getSoalToken(fakeAdmin);
};
