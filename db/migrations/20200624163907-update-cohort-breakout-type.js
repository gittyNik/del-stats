import replaceEnum from '../../src/util/replaceEnum';

const BREAKOUT_TYPE = [
  'lecture',
  'codealong',
  'questionhour',
  'activity',
  'groupdiscussion',
  'reviews',
  'assessment',
  '1on1',
];
const OLD_BREAKOUT_TYPE = [
  'lecture',
  'codealong',
  'questionhour',
  'activity',
  'groupdiscussion',
  'reviews',
];

export function up(queryInterface) {
  return replaceEnum({
    queryInterface,
    tableName: 'cohort_breakouts',
    columnName: 'type',
    defaultValue: 'lecture',
    newValues: BREAKOUT_TYPE,
    enumName: 'enum_cohort_breakouts_type',
  });
}
export function down(queryInterface) {
  return replaceEnum({
    queryInterface,
    tableName: 'cohort_breakouts',
    columnName: 'type',
    defaultValue: 'lecture',
    newValues: OLD_BREAKOUT_TYPE,
    enumName: 'enum_cohort_breakouts_type',
  });
}
