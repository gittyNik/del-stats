const replaceEnum = require('../../src/util/replaceEnum.js');

const old_request_status = [
  'accepted',
  'rejected',
  'retained',
];
const request_status = [
  'accepted',
  'rejected',
  'retained',
  'pending',
];

module.exports = {
  up: (queryInterface) => replaceEnum({
    queryInterface,
    tableName: 'cohort_breakout_applied_catalysts',
    columnName: 'status',
    defaultValue: 'pending',
    newValues: request_status,
    enumName: 'enum_cohort_breakout_applied_catalysts_status',
  }),

  down: (queryInterface) => replaceEnum({
    queryInterface,
    tableName: 'cohort_breakout_applied_catalysts',
    columnName: 'status',
    newValues: old_request_status,
    enumName: 'enum_cohort_breakout_applied_catalysts_status',
  }),
};
