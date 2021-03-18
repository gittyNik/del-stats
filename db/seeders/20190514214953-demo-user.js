import { v4 as uuid } from 'uuid';
import faker from 'faker';
import _ from 'lodash';
import { cleanArray, cleanJSON } from '../../src/util/seederUtils';

const USER_ROLES = ['learner', 'educator', 'enabler', 'catalyst', 'admin',
  'guest', 'superadmin', 'reviewer', 'operations', 'recruiter', 'career-services'];

const AVAILABLE_USER_STATUS = [
  'medical emergency',
  'dropout',
  'moved',
  'respawning core phase',
  'respawning focus phase',
  'irregular',
  'focus phase',
  'core phase',
  'frontend',
  'backend',
  'admission terminated',
  'long leave',
  'joining later',
  'prefers hindi',
  'back after absence',
  'graduated',
  'past-learner',
  'other',
];

const USER = () => {
  const returnObj = {
    id: uuid(),
    name: faker.name.firstName(),
    email: faker.internet.email(),
    phone: faker.phone.phoneNumber('91##########'),
    role: _.sample(USER_ROLES),
    location: faker.address.city(),
    picture: faker.internet.avatar(),
    created_at: new Date(),
    updated_at: new Date(),
    profile: cleanJSON({
      description: faker.lorem.sentence(),
    }),
  };

  if (returnObj.role === 'learner') {
    returnObj.status = [_.sample(AVAILABLE_USER_STATUS)];
    returnObj.status_reason = cleanArray([{
      reason: faker.lorem.sentence(),
      created_at: new Date(),
    }]);
  }

  return returnObj;
};

const seeder = {
  up: (queryInterface, Sequelize) => queryInterface.bulkInsert(
    'users', _.times(100, USER),
    {
      profile: { type: new Sequelize.JSON() },
    },
  ),

  down: queryInterface => queryInterface.bulkDelete('users', null, {}),
};

export default seeder;
