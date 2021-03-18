const replaceEnum = require('../../src/util/replaceEnum.js');

const APPLICATION_STAGE = [
  'firewall-test', 'isa-selection', 'cohort-selection_payment',
  'cohort-selection_job-guarantee',
  'cohort-selection-loan', 'verification-digio-document-creation',
  'verification-digio-esign',
  'verification-document-upload', 'verification-document-verified',
  'payment_full',
  'authorisation-github', 'authorisation-zoom',
  'mandate-request', 'mandate-created', 'mandate-failed',
  'verification-digio-esign-failed',
  'initial_payment-failed', 'full_payment-failed', 'part_payment-failed',
  'initial_payment-success', 'full_payment-success', 'part_payment-success',
];
const OLD_APPLICATION_STAGE = [
  'firewall-test', 'isa-selection', 'cohort-selection_payment',
  'cohort-selection_job-guarantee',
  'cohort-selection-loan', 'verification-digio-document-creation',
  'verification-digio-esign',
  'verification-document-upload', 'verification-document-verified',
  'payment_full',
  'authorisation-github', 'authorisation-zoom',
];

module.exports = {
  up: (queryInterface) => replaceEnum({
    queryInterface,
    tableName: 'applications',
    columnName: 'stage',
    defaultValue: 'firewall-test',
    newValues: APPLICATION_STAGE,
    enumName: 'enum_applications_stage',
  }),

  down: (queryInterface) => replaceEnum({
    queryInterface,
    tableName: 'applications',
    columnName: 'stage',
    defaultValue: 'firewall-test',
    newValues: OLD_APPLICATION_STAGE,
    enumName: 'enum_applications_stage',
  }),
};
