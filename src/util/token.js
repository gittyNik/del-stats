import {USER_ROLES} from '../models/user';
//import {USER_ROLES} from '../models/user.seq'
import AUTH_SCOPES from './authScopes';
import jwt from 'jsonwebtoken';

// Mongoose user Model
const getScope = user => {
  switch(user.role) {
    case USER_ROLES.EDUCATOR: return AUTH_SCOPES.EDUCATOR;
    case USER_ROLES.SUPERADMIN: return AUTH_SCOPES.ALL;
    default: return AUTH_SCOPES.STUDENT;
  }
}


// Sequelize User Model
// const getScopeSeq = User => {
//   switch(User.role){
//     case USER_ROLES.EDUCATOR: return AUTH_SCOPES.EDUCATOR;
//     case USER_ROLES.SUPERADMIN: return AUTH_SCOPES.ALL;
//     case USER_ROLES.SOALMATE: return AUTH_SCOPES.SOALMATE;
//     case USER_ROLES.STUDENT: return AUTH_SCOPES.STUDENT;
//     case USER_ROLES.CATALYST: return AUTH_SCOPES.CATALYST;
//     default: return AUTH_SCOPES.SOALMATE;
//   }
// }

// export const getSoalMobileToken = (User, )

//GITHUB TOKEN
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
