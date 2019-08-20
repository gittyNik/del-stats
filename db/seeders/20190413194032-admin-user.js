import uuid from 'uuid/v4';
import { USER_ROLES } from '../../src/models/user';

const { DEFAULT_USER } = process.env;

const seeder = {
  up: queryInterface => queryInterface.bulkInsert('users', [{
    id: uuid(),
    role: USER_ROLES.SUPERADMIN,
    name: 'Super Admin',
    email: DEFAULT_USER,
  }], {}),

  down: queryInterface => queryInterface.bulkDelete('users', null, {}),
};

export default seeder;
