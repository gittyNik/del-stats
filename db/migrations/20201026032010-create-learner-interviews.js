'use strict';
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('learner_interviews', {
      id: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.UUID,
        default: Sequelize.UUIDV4,
      },
      recruiter_ids: {
        allowNull: false,
        type: Sequelize.ARRAY(Sequelize.UUID),
      },
      learner_id: {
        allowNull: false,
        type: Sequelize.UUID
      },
      codepad_id: {
        allowNull: false,
        type: Sequelize.STRING
      },
      codeinterview_link: {
        allowNull: false,
        type: Sequelize.STRING
      },
      interview_date: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('NOW()'),
      },
      interviewer_remarks: {
        type: Sequelize.STRING,
        defaultValue: ""
      },
      final_status: {
        type: Sequelize.STRING
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
    return queryInterface.dropTable('learner_interviews');
  }
};