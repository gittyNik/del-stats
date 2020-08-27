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
  up: (queryInterface, Sequelize) => queryInterface.sequelize.transaction(t => Promise.all([
    queryInterface.changeColumn('applications', 'is_isa', {
      type: Sequelize.BOOLEAN,
      defaultValue: false,
    }, { transaction: t }),
    queryInterface.changeColumn('applications', 'stage', {
      type: Sequelize.ENUM(...APPLICATION_STAGE),
      defaultValue: 'firewall-test'
    }, { transaction: t }),
  ])),

  down: (queryInterface, Sequelize) => queryInterface.sequelize.transaction(t => Promise.all([
    queryInterface.removeColumn('applications', 'is_isa', { transaction: t }),
    queryInterface.removeColumn('applications', 'stage', { transaction: t }),
  ])),
};
