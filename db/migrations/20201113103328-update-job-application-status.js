const replaceEnum = require('../../src/util/replaceEnum.js');

const APPLICATION_STATUS = [
  'active',
  'assignment',
  'interview',
  'shortlisted',
  'hired',
  'rejected',
  'closed',
  'shortlisted-by-soal',
];
const OLD_APPLICATION_STATUS = [
  'active',
  'assignment',
  'interview',
  'shortlisted',
  'hired',
  'rejected',
  'closed',
];

module.exports = {
  up: (queryInterface) => replaceEnum({
    queryInterface,
    tableName: 'job_applications',
    columnName: 'status',
    defaultValue: 'active',
    newValues: APPLICATION_STATUS,
    enumName: 'enum_job_applications_status',
  }),

  down: (queryInterface) => replaceEnum({
    queryInterface,
    tableName: 'job_applications',
    columnName: 'status',
    defaultValue: 'active',
    newValues: OLD_APPLICATION_STATUS,
    enumName: 'enum_job_applications_status',
  }),
};
