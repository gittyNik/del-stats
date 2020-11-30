import uuid from 'uuid/v4';
import faker from 'faker';
import _ from 'lodash';

const USER = {
  id: uuid(),
  name: faker.name.firstName(),
  email: faker.internet.email(),
  phone: faker.phone.phoneNumber('+91##########'),
  role: 'learner',
  location: faker.address.city(),
  // picture: faker.internet.avatar(), not migrated on table
};

const APPLICATION_STAGE = [
  'firewall-test', 'isa-selection', 'cohort-selection_payment',
  'cohort-selection_job-guarantee',
  'cohort-selection-loan', 'verification-digio-document-creation',
  'verification-digio-esign',
  'verification-document-upload', 'verification-document-verified',
  'payment_full',
  'authorisation-github', 'authorisation-zoom',
];

const seeder = {
  up: (queryInterface, Sequelize) => queryInterface.sequelize.transaction(async (t) => {
    const addUser = queryInterface.bulkInsert(
      'users', [USER],
      { transaction: t },
      {
        profile: { type: new Sequelize.JSON() },
        status: { type: new Sequelize.ARRAY(Sequelize.JSON) },
        status_reason: { type: new Sequelize.ARRAY(Sequelize.JSON) },
      },
    );

    const cohorts = await queryInterface.sequelize.query(
      `SELECT id from cohorts;`
    );

    const APPLICATION = () => ({
      id: uuid(),
      user_id: USER.id,
      cohort_applied: (_.sample(cohorts[0])).id,
      cohort_joining: (_.sample(cohorts[0])).id,
      status: _.sample(['applied',
        'review_pending',
        'offered',
        'rejected',
        'joined',
        'archieved']),
      stage: _.sample(APPLICATION_STAGE),
      is_isa: _.sample([true, false]),
      is_job_guarantee: _.sample([true, false]),
      created_at: new Date(),
      updated_at: new Date(),
      payment_type: _.sample(['cash', 'cheque']),
      payment_details: {
        transactionId: uuid(),
        status: 'successful',
      },
    });

    const addApplications = queryInterface.bulkInsert(
      'applications',
      _.times(100, APPLICATION), { transaction: t },
      {
        releases: { type: new Sequelize.JSON() },
        payment_details: { type: new Sequelize.JSON() },
      },
    );

    return Promise.all([addUser, addApplications])
      .then(() => console.log('Seeded Applications'))
      .catch(err => console.error(err));
  }),

  down: async queryInterface => queryInterface.sequelize.transaction(t => Promise.all([
    queryInterface.bulkDelete('users', null, { transaction: t }),
    queryInterface.bulkDelete('applications', null, { transaction: t }),
  ])
    .then(() => console.log('users and applications reverted'))
    .catch(err => console.error(err))),
};

export default seeder;
