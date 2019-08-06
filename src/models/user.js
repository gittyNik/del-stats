import Sequelize from 'sequelize';
import db from '../database';
import uuid from 'uuid/v4';

const {DEFAULT_USER} = process.env;

export const USER_ROLES = Object.freeze({
  LEARNER: 'learner',
  EDUCATOR: 'educator',
  ENABLER: 'enabler',
  CATALYST: 'catalyst',
  ADMIN: 'admin',
  GUEST: 'guest',
  SUPERADMIN: 'superadmin',
});

export const User = db.define('users', {
  name: Sequelize.STRING,
  email: Sequelize.STRING,
  phone: Sequelize.STRING,
  role: Sequelize.STRING,
  location: Sequelize.STRING,
  profile: Sequelize.JSON,        // profile: {key: {value, source, details}}
},{});

export const getProfile = userId => User.findByPk(userId);

export const getOrCreateUser = phone => User.findOrCreate({
  where:{
    phone,
    role: USER_ROLES.GUEST
  },
  defaults: {
    id: uuid()
  }
});

export const createSuperAdmin = ()=> User.findOrCreate({
  where:{
    email: DEFAULT_USER,
    role: USER_ROLES.SUPERADMIN
  },
  raw: true,
  defaults: {
    id: uuid()
  }
});

export default User;