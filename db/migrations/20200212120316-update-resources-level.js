'use strict';

const replaceEnum = require('../../src/util/replaceEnum.js');

module.exports = {
  up: (queryInterface, Sequelize) => {
    return replaceEnum({
      queryInterface,
      tableName: 'resources',
      columnName: 'level',
      defaultValue: 'beginner',
      newValues: ['beginner', 'intermediate', 'advance'],
      enumName: 'enum_resources_level'
    });
  },

  down: (queryInterface, Sequelize) => {
    return replaceEnum({
      queryInterface,
      tableName: 'resources',
      columnName: 'level',
      defaultValue: 'beginner',
      newValues: ['beginner', 'advanced'],
      enumName: 'enum_resources_level'
    });
  }
};