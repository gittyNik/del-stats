import Sequelize from 'sequelize';
import { v4 as uuid } from 'uuid';
import db from '../database';
// import { CohortBreakout } from './cohort_breakout';
// import { User } from './user';

export const CohortBreakoutAppliedCatalyst = db.define('cohort_breakout_applied_catalysts', {
  id: {
    allowNull: false,
    primaryKey: true,
    type: Sequelize.UUID,
    default: Sequelize.UUIDV4,
  },
  cohort_breakout_id: {
    type: Sequelize.UUID,
  },
  applied_catalyst_id: {
    type: Sequelize.UUID,
  },
}, {
  tableName: 'cohort_breakout_applied_catalysts',
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  deletedAt: 'deteled_at',
  paranoid: true,
  timestamps: true,
});

export const createBreakoutAppliedCatalystRelation = ({
  id, cohort_breakout_id,
  applied_catalysts_id,
}) => CohortBreakoutAppliedCatalyst.create({
  id: id || uuid(),
  cohort_breakout_id,
  applied_catalysts_id,
  // created_at: new Date(),
});
