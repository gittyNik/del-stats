import Sequelize from 'sequelize';
import db from '../database';

export const USER_ROLES = Object.freeze({
  LEARNER: 'learner',
  EDUCATOR: 'educator',
  ENABLER: 'enabler',
  CATALYST: 'catalyst',
  ADMIN: 'admin',
  GUEST: 'guest',
  SUPERADMIN: 'superadmin',
});

const User = db.define('users', {
  name: Sequelize.STRING,
  email: Sequelize.STRING,
  phone: Sequelize.STRING
  role: Sequelize.STRING,
  location: Sequelize.STRING,
  profile: Sequelize.ARRAY(Sequelize.JSON),
},{});

export default User;
