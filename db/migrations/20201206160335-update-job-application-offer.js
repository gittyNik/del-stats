const replaceEnum = require('../../src/util/replaceEnum.js');

const OFFER_STATUS = [
  'offered',
  'accepted',
  'candidate-rejected',
  'recruiter-rejected',
  'soal-rejected',
  '',
];
const OLD_OFFER_STATUS = [
  'offered',
  'accepted',
  'candidate-rejected',
  'recruiter-rejected',
];

module.exports = {
  up: (queryInterface) => replaceEnum({
    queryInterface,
    tableName: 'job_applications',
    columnName: 'offer_status',
    newValues: OFFER_STATUS,
    defaultValue: '',
    enumName: 'enum_job_applications_offer_status',
  }),

  down: (queryInterface) => replaceEnum({
    queryInterface,
    tableName: 'job_applications',
    columnName: 'offer_status',
    newValues: OLD_OFFER_STATUS,
    enumName: 'enum_job_applications_offer_status',
  }),
};
