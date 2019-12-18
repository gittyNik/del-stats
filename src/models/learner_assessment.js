import Sequelize from 'sequelize';
import db from '../database';


export const LearnerAssessment = db.define('assessments', {
  id: {
    type: Sequelize.UUID,
    primaryKey: true,
  },
  cohort_assessment_id: {
    type: Sequelize.UUID,
    references: { model: 'cohort_assessments', key: 'id' },
  },
  learner_id: {
    type: Sequelize.UUID,
    references: { model: 'users', key: 'id' },
  },
  review: Sequelize.TEXT,
  reviewed_by: {
    type: Sequelize.UUID,
    references: { model: 'users', key: 'id' },
  },
  learner_feedback: Sequelize.TEXT,
});

export default LearnerAssessment;
