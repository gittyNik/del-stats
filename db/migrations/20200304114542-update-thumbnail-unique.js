'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.removeConstraint('resources', 'resources_thumbnail_key', {})
  },

  down: (queryInterface, Sequelize) => {
    /*
      Add reverting commands here.
      Return a promise to correctly handle asynchronicity.

      Example:
      return queryInterface.dropTable('users');
    */
  }
};
