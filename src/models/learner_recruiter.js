import Sequelize from 'sequelize';
import uuid from 'uuid/v4';
import db from '../database';

const LearnerRecruiters = db.define('learner_recruiters', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.UUID
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

const addData = (learner_interview_id, recruiter_id) => LearnerRecruiters.create({
	id: uuid(),
	learner_interview_id,
	recruiter_id
})


export {
	LearnerRecruiters
}