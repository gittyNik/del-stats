const replaceEnum = require('../../src/util/replaceEnum.js');

const COHORT_STATUS = ['upcoming',
  'live',
  'completed',
  'deferred',
  'reallocated',
];
const OLD_COHORT_STATUS = [
  'upcoming',
  'live',
  'completed',
  'deferred',
  'reallocated',
  'suitup',
  'filled',
  'fast-filling',
];

module.exports = {
  up: (queryInterface) => replaceEnum({
    queryInterface,
    tableName: 'cohorts',
    columnName: 'status',
    defaultValue: 'upcoming',
    newValues: COHORT_STATUS,
    enumName: 'enum_cohorts_status',
  }),

  down: (queryInterface) => replaceEnum({
    queryInterface,
    tableName: 'cohorts',
    columnName: 'status',
    defaultValue: 'upcoming',
    newValues: OLD_COHORT_STATUS,
    enumName: 'enum_cohorts_status',
  }),
};
