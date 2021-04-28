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
  created_at: {
    type: Sequelize.DATE,
  },
  updated_at: {
    type: Sequelize.DATE,
    defaultValue: Sequelize.literal('NOW()'),
  },
});

export const createBreakoutAppliedCatalystRelation = ({
  id, cohort_breakout_id,
  applied_catalyst_id,
}) => CohortBreakoutAppliedCatalyst.create({
  id: id || uuid(),
  cohort_breakout_id,
  applied_catalyst_id,
  created_at: new Date(),
});
