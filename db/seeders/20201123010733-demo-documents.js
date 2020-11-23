import uuid from 'uuid/v4';
import faker from 'faker';
import _ from 'lodash';

const USER_ROLES = ['learner', 'educator', 'enabler', 'catalyst', 'admin',
  'guest', 'superadmin', 'reviewer', 'operations', 'recruiter', 'career-services'];

const providers = ['stackoverflow', 'github', 'google', 'facebook', 'linkedin', 'zoom'];

const USER = {
  id: uuid(),
  name: faker.name.firstName(),
  email: faker.internet.email(),
  phone: faker.phone.phoneNumber('+91##########'),
  role: _.sample(USER_ROLES),
  location: faker.address.city(),
  // picture: faker.internet.avatar(), not migrated on table
};

const application_status = ['requested', 'signed', 'payment-pending', 'payment-partial', 'payment-complete'];

const DOCUMENT = () => ({
  id: uuid(),
  created_at: new Date(),
  updated_at: new Date(),
  user_id: USER.id,
  is_verified: _.sample([true, false]),
  status: _.sample(application_status),
  updated_by: new Date(),
  user_documents: [{ document: faker.lorem.sentence() }],
});

module.exports = {
  up: (queryInterface, Sequelize) => queryInterface.sequelize.transaction(async (t) => {
    const addUser = queryInterface.bulkInsert(
      'users',
      [USER()], { transaction: t },
      { releases: { type: Sequelize.JSON() } },
    );

    const addDocument = queryInterface.bulkInsert(
      'documents',
      _.times(100, DOCUMENT), { transaction: t },
      {
        document_details: { type: new Sequelize.JSON() },
      },
    );

    return Promise.all([addUser, addDocument])
      .then(() => console.log('Seeded Documents'))
      .catch(err => console.error(err));
  }),

  down: async queryInterface => queryInterface.sequelize.transaction(t => Promise.all([
    queryInterface.bulkDelete('users', null, { transaction: t }),
    queryInterface.bulkDelete('documents', null, { transaction: t }),
  ])
    .then(() => console.log('users and documents reverted'))
    .catch(err => console.error(err))),
};
