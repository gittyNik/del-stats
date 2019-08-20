import Sequelize from 'sequelize';
import db from '../database';

const Application = db.define('applications', {
  id: {
    type: Sequelize.UUID,
    primaryKey: true,
  },
  user_id: {
    type: Sequelize.UUID,
    allowNull:false,
  },
  cohort_applied: Sequelize.UUID, 
  cohort_joining: Sequelize.UUID,
  status: Sequelize.ENUM('applied', 'review_pending', 'offered', 'rejected', 'joined', 'archieved'), 
  payment_details: Sequelize.JSON,
  created_at: {
    allowNull: false,
    type: Sequelize.DATE,
  },
  updated_at: {
    allowNull: false,
    type: Sequelize.DATE,
  },
})

export default Application;
