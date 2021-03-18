import Sequelize from 'sequelize';
import { v4 as uuid } from 'uuid';
import db from '../database';

const CohortBreakoutAppliedCatalyst = db.define('cohort_breakout_applied_catalyst', {
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
    // defaultValue: Sequelize.literal('NOW()'),
  },
  updated_at: {
    type: Sequelize.DATE,
    defaultValue: Sequelize.literal('NOW()'),
  },
});

const createBreakoutAppliedCatalystRelation = (cohort_breakout_id,
  applied_catalysts_id) => CohortBreakoutAppliedCatalyst.create({
  id: uuid(),
  cohort_breakout_id,
  applied_catalysts_id,
  created_at: new Date(),
});

export {
  CohortBreakoutAppliedCatalyst,
  createBreakoutAppliedCatalystRelation,
};
