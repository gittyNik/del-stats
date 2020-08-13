'use strict';
const APPLICATION_STAGE = [
  'firewall-test', 'isa-selection', 'cohort-selection_payment',
  'cohort-selection_job-guarantee',
  'cohort-selection-loan', 'verification-digio-document-creation',
  'verification-digio-esign',
  'verification-document-upload', 'verification-document-verified',
  'payment_full',
  'authorisation-github', 'authorisation-zoom',
];

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction(t => {
      return Promise.all([
        queryInterface.addColumn('applications', 'is_isa', {
          type: Sequelize.BOOLEAN,
          defaultValue: false
        }, { transaction: t }),
        queryInterface.addColumn('applications', 'stage', {
          type: Sequelize.ENUM(...APPLICATION_STAGE)
        }, { transaction: t })
      ]);
    });
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction(t => {
      return Promise.all([
        queryInterface.removeColumn('applications', 'is_isa', { transaction: t }),
        queryInterface.removeColumn('applications', 'stage', { transaction: t })
      ]);
    });
  }
};
