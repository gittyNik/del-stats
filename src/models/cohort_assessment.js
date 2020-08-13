import Sequelize from 'sequelize';
import db from '../database';

export const CohortAssessment = db.define('cohort_assessments', {
  id: {
    type: Sequelize.UUID,
    primaryKey: true,
  },
  cohort_id: {
    type: Sequelize.UUID,
    references: { model: 'cohorts', key: 'id' },
  },
  assessment_id: {
    type: Sequelize.UUID,
    references: { model: 'assessments', key: 'id' },
  },
  catalyst_id: {
    type: Sequelize.UUID,
    references: { model: 'users', key: 'id' },
  },
  location: Sequelize.STRING,
  time_scheduled: Sequelize.DATE,
});

export default CohortAssessment;
