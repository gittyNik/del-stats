'use strict';
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('learner_recruiters', {
      id: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.UUID,
        default: Sequelize.UUIDV4,
      },
      learner_interview_id: {
        type: Sequelize.UUID
      },
      recruiter_id: {
        type: Sequelize.UUID
      },
      created_at: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('NOW()'),
      },
      updated_at: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('NOW()'),
      }
    });
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('learner_recruiters');
  }
};