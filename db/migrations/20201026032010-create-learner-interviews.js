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
      // recruiter_ids: {
      //   allowNull: false,
      //   type: Sequelize.ARRAY({
      //     type: Sequelize.UUID,
      //     references: { model: 'users', key: 'id'  }
      //   })
      // },
      learner_id: {
        allowNull: false,
        type: Sequelize.UUID,
        references: { model: 'users', key: 'id'  },
      },
      job_application_id: {
        allowNull: false,
        type: Sequelize.UUID,
        references: { model: 'job_applications', key: 'id'  },
      },
      codepad_id: {
        allowNull: false,
        type: Sequelize.STRING
      },
      codeinterview_link: {
        allowNull: false,
        type: Sequelize.STRING
      },
      interview_round: {
        allowNull: false,
        type: Sequelize.INTEGER,
        defaultValue: 1
      },
      interview_date: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('NOW()'),
      },
      interview_slot: {
        allowNull: false,
        type: Sequelize.TIME
      },
      interview_duration: {
        allowNull: false,
        type: Sequelize.INTEGER,
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
      },
    });
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('learner_interviews');
  }
};