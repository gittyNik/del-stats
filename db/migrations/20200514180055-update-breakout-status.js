const replaceEnum = require('../../src/util/replaceEnum.js');

const EVENT_STATUS = ['scheduled', 'started', 'cancelled',
  'aborted', 'running', 'completed', 'review-shared'];
const OLD_EVENT_STATUS = ['scheduled', 'started', 'cancelled',
  'aborted', 'running', 'completed'];

module.exports = {
  up: (queryInterface) => replaceEnum({
    queryInterface,
    tableName: 'cohort_breakouts',
    columnName: 'status',
    defaultValue: 'scheduled',
    newValues: EVENT_STATUS,
    enumName: 'enum_cohort_breakouts_status',
  }),

  down: (queryInterface) => replaceEnum({
    queryInterface,
    tableName: 'cohort_breakouts',
    columnName: 'status',
    defaultValue: 'scheduled',
    newValues: OLD_EVENT_STATUS,
    enumName: 'enum_cohort_breakouts_status',
  }),
};
