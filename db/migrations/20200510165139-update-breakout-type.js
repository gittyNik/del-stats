const replaceEnum = require('../../src/util/replaceEnum.js');

const BREAKOUT_TYPE = ['lecture', 'codealong', 'questionhour',
  'activity', 'groupdiscussion', 'reviews'];
const OLD_BREAKOUT_TYPE = ['lecture', 'codealong', 'questionhour',
  'activity', 'groupdiscussion'];

module.exports = {
  up: (queryInterface) => replaceEnum({
    queryInterface,
    tableName: 'cohort_breakouts',
    columnName: 'type',
    defaultValue: 'lecture',
    newValues: BREAKOUT_TYPE,
    enumName: 'enum_cohort_breakouts_type',
  }),

  down: (queryInterface) => replaceEnum({
    queryInterface,
    tableName: 'cohort_breakouts',
    columnName: 'type',
    defaultValue: 'lecture',
    newValues: OLD_BREAKOUT_TYPE,
    enumName: 'enum_cohort_breakouts_type',
  }),
};
