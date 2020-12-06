import Sequelize from 'sequelize';
import uuid from 'uuid/v4';
import db from '../database';
import { createPad } from '../integrations/codeinterview/controllers';

const LearnerInterviews = db.define('learner_interviews', {
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
  //     // references: { model: 'users', key: 'id'  }
  //   })
  // },
  learner_id: {
    allowNull: false,
    type: Sequelize.UUID,
    // references: { model: 'users', key: 'id'  },
  },
  job_application_id: {
    allowNull: false,
    type: Sequelize.UUID,
    // references: { model: 'job_applications', key: 'id'  },
  },
  codepad_id: {
    allowNull: false,
    type: Sequelize.STRING,
  },
  codeinterview_link: {
    allowNull: false,
    type: Sequelize.STRING,
  },
  interview_round: {
    allowNull: false,
    type: Sequelize.INTEGER,
    defaultValue: 1,
  },
  interview_date: {
    allowNull: false,
    type: Sequelize.DATE,
    defaultValue: Sequelize.literal('NOW()'),
  },
  interview_slot: {
    allowNull: false,
    type: Sequelize.TIME,
  },
  interview_duration: {
    allowNull: false,
    type: Sequelize.INTEGER,
  },
  interviewer_remarks: {
    type: Sequelize.JSON,
  },
  final_status: {
    type: Sequelize.STRING,
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

const getInterviewById = id => LearnerInterviews.findOne({ where: { id }, returning: true });

const getInterview = (learner_id, job_application_id,
  interview_round) => LearnerInterviews.findOne({
  where: {
    learner_id, job_application_id, interview_round,
  },
  // include: [{ model: User, as: 'Recruiters' },
  // { model: User, as: 'LearnerDetails' }, { model: JobApplication, as: 'JobApplicationDetails' }],
  returning: true,
});

const getAllInterviewsForLearner = learner_id => LearnerInterviews.findAll({
  where: {
    learner_id,
  },
  attributes: [
    'id',
    'learner_id',
    'job_application_id',
    'interview_date',
    'interview_slot',
    'interview_duration',
  ],
  raw: true,
});

const createInterview = async (interview, name = 'Interview - SOAL Recruitment Drive') => {
  let codepad = await createPad(name);
  return LearnerInterviews.create({
    id: uuid(),
    codepad_id: codepad.id,
    codeinterview_link: codepad.url,
    ...interview,
  });
};

const updateInterviewById = (id, interview) => LearnerInterviews.update({
  ...interview,
}, {
  where: {
    id,
  },
  returning: true,
});

const updateInterview = (learner_id, job_application_id,
  interview_round, interview) => LearnerInterviews.update({
  ...interview,
}, {
  where: {
    learner_id,
    job_application_id,
    interview_round,
  },
});

export {
  LearnerInterviews,
  getInterviewById,
  getInterview,
  getAllInterviewsForLearner,
  createInterview,
  updateInterviewById,
  updateInterview,
};
