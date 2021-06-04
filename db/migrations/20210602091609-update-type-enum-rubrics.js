const replaceEnum = require('../../src/util/replaceEnum.js');

const OLD_RUBRIC_TYPE = [
  'milestone',
  'core-phase',
  'focus-phase',
];

const RUBRIC_TYPE = [
  'milestone',
  'core-phase',
  'focus-phase',
  'mock-interview',
];

module.exports = {
  up: (queryInterface) => replaceEnum({
    queryInterface,
    tableName: 'rubrics',
    columnName: 'type',
    newValues: RUBRIC_TYPE,
    defaultValue: 'milestone',
    enumName: 'enum_rubrics_type',
  }),

  down: (queryInterface) => replaceEnum({
    queryInterface,
    tableName: 'rubrics',
    columnName: 'type',
    newValues: OLD_RUBRIC_TYPE,
    defaultValue: 'milestone',
    enumName: 'enum_rubrics_type',
  }),
};
