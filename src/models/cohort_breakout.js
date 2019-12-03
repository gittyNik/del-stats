import Sequelize from 'sequelize';
import uuid from 'uuid/v4';
import db from '../database';
import { Cohort } from './cohort';
import { Topic } from './topic';

export const EVENT_STATUS = ['scheduled', 'started', 'cancelled', 'aborted', 'running'];
export const BREAKOUT_TYPE = ['lecture', 'codealong', 'questionhour', 'activity', 'groupdiscussion'];

export const CohortBreakout = db.define('cohort_breakouts', {
  id: {
    type: Sequelize.UUID,
    primaryKey: true,
  },
  type: {
    type: Sequelize.ENUM(...BREAKOUT_TYPE),
    defaultValue: 'lecture',
  },
  domain: Sequelize.STRING,
  topic_id: Sequelize.UUID,
  cohort_id: Sequelize.UUID,
  time_scheduled: {
    type: Sequelize.DATE,
    allowNull: false,
  },
  duration: {
    type: Sequelize.INTEGER,
    defaultValue: 1800000, // half an hour in milliseconds
  },
  location: Sequelize.STRING,
  catalyst_id: Sequelize.UUID,
  status: {
    type: Sequelize.ENUM(...EVENT_STATUS),
    defaultValue: 'scheduled',
  },
  catalyst_notes: Sequelize.TEXT,
  catalyst_feedback: Sequelize.TEXT,
  attendance_count: Sequelize.INTEGER,
  created_at: {
    allowNull: false,
    type: Sequelize.DATE,
    defaultValue: Sequelize.literal('NOW()'),
  },
  updated_at: {
    allowNull: false,
    type: Sequelize.DATE,
    defaultValue: Sequelize.literal('NOW()'),
  },
});

CohortBreakout.belongsTo(Topic);
Topic.hasMany(CohortBreakout, { foreignKey: 'topic_id' });

export const scheduleBreakoutLecture = (topic_id, cohort_id, time_scheduled) => CohortBreakout.create({
  id: uuid(),
  topic_id,
  cohort_id,
  time_scheduled,
});

export const startBreakout = (topic_id, cohort_id, time_scheduled) => CohortBreakout.create({
  id: uuid(),
  topic_id,
  cohort_id,
  time_scheduled,
  status: 'started',
});
