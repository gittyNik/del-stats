import Sequelize from 'sequelize';
import { v4 as uuid } from 'uuid';
import db from '../database';

const LearnerRecruiters = db.define('learner_recruiters', {
  id: {
    allowNull: false,
    primaryKey: true,
    type: Sequelize.UUID,
    default: Sequelize.UUIDV4,
  },
  learner_interview_id: {
    type: Sequelize.UUID,
  },
  recruiter_id: {
    type: Sequelize.UUID,
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

const createInterviewRecuiterRelation = (learner_interview_id,
  recruiter_id) => LearnerRecruiters.create({
    id: uuid(),
    learner_interview_id,
    recruiter_id,
  });

export {
  LearnerRecruiters,
  createInterviewRecuiterRelation,

};
