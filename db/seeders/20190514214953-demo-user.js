import uuid from 'uuid/v4';
import faker from 'faker';
import _ from 'lodash';

const USER_ROLES = ['learner', 'educator', 'enabler', 'catalyst', 'admin',
  'guest', 'superadmin', 'reviewer', 'operations', 'recruiter', 'career-services'];

const USER = () => ({
  id: uuid(),
  name: faker.name.firstName(),
  email: faker.internet.email(),
  phone: faker.phone.phoneNumber('+91##########'),
  role: _.sample(USER_ROLES),
  location: faker.address.city(),
  // picture: faker.internet.avatar(), not migrated on table
});

const seeder = {
  up: (queryInterface, Sequelize) => queryInterface.bulkInsert(
    'users', _.times(100, USER),
    {
      profile: { type: Sequelize.JSON() },
    },
  ),

  down: queryInterface => queryInterface.bulkDelete('users', null, {}),
};

export default seeder;
