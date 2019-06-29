// user_id, 
// cohort_applied, 
// cohort_joining, 
// status, 
// payment_details

'use strict';
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('applications', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDv4,
        primaryKey: true,
      },
      user_id: {
        type: Sequelize.UUID,
        allowNull:false,
      },
      cohort_applied: {
        type: Sequelize.STRING, // program id of cohort can be kept
        allowNull: true,
      },
      cohort_joining: {
        type: Sequelize.STRING, // program id of cohort can be kept
        allowNull: true,
      },
      status: {
        type: Sequelize.STRING, // enum can be kept
        allowNull: true,
      },
      payment_details: {
        type: Sequelize.JSON,
        allowNull: true,
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW,
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW,
      },
    });
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('applications');
  }
};
