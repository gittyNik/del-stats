import { v4 as uuid } from 'uuid';
import faker from 'faker';
import _ from 'lodash';
import { cleanJSON } from '../../src/util/seederUtils';

const USER_ROLES = ['learner', 'educator', 'enabler', 'catalyst', 'admin',
  'guest', 'superadmin', 'reviewer', 'operations', 'recruiter', 'career-services'];

const providers = ['stackoverflow', 'github', 'google', 'facebook', 'linkedin', 'zoom'];

const USER = {
  id: uuid(),
  name: faker.name.firstName(),
  email: faker.internet.email(),
  phone: faker.phone.phoneNumber('91##########'),
  role: _.sample(USER_ROLES),
  location: faker.address.city(),
  // picture: faker.internet.avatar(), not migrated on table
};

const SOCIAL_CONNECTION = () => ({
  id: uuid(),
  user_id: USER.id,
  provider: _.sample(providers),
  username: faker.name.firstName(),
  email: faker.internet.email(),
  access_token: faker.internet.ipv6(),
  expiry: faker.date.future(),
  created_at: new Date(),
  updated_at: new Date(),
  profile: cleanJSON({
    description: faker.lorem.sentence(),
  }),
});
//  profile: Sequelize.JSON,

module.exports = {
  up: (queryInterface, Sequelize) => queryInterface.sequelize.transaction(async (t) => {
    const addUser = queryInterface.bulkInsert(
      'users',
      [USER], { transaction: t },
      { releases: { type: new Sequelize.JSON() } },
    );

    const addSocialConnection = queryInterface.bulkInsert(
      'social_connections',
      _.times(100, SOCIAL_CONNECTION), { transaction: t },
    );

    return Promise.all([addUser, addSocialConnection])
      .then(() => console.log('Seeded Social Connections'))
      .catch(err => console.error(err));
  }),

  down: async queryInterface => queryInterface.sequelize.transaction(t => Promise.all([
    queryInterface.bulkDelete('users', null, { transaction: t }),
    queryInterface.bulkDelete('social_connections', null, { transaction: t }),
  ])
    .then(() => console.log('milestones and topics reverted'))
    .catch(err => console.error(err))),
};
