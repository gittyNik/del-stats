import uuid from 'uuid/v4';
import { USER_ROLES } from '../../src/models/user';

const { DEFAULT_USER } = process.env;

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.bulkInsert('users', [{
      id: uuid(),
      role: USER_ROLES.SUPERADMIN,
      name: 'Super Admin',
      email: DEFAULT_USER,
    }], {});
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete('users', null, {});
  }
};

