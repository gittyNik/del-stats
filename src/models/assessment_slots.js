import Sequelize from 'sequelize';
import db from '../database';

export const AssessmentSlots = db.define('assessment_slots', {
  id: {
    type: Sequelize.UUID,
    defaultValue: Sequelize.UUIDV4,
    primaryKey: true,
  },
  created_at: {
    type: Sequelize.DATE,
  },
  updated_at: {
    type: Sequelize.DATE,
    defaultValue: Sequelize.literal('NOW()'),
  },
  cohort_duration: {
    type: Sequelize.INTEGER,
  },
  program: {
    type: Sequelize.STRING,
    references: { model: 'programs', key: 'id' },
  },
  assessment_day: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  time_scheduled: {
    type: Sequelize.TIME,
    allowNull: false,
  },
  reviewer: {
    type: Sequelize.UUID,
    references: { model: 'users', key: 'id' },
    allowNull: true,
  },
  week: {
    type: Sequelize.INTEGER,
    defaultValue: 1,
  },
  assessment_duration: {
    type: Sequelize.INTEGER,
  },
  slot_order: {
    type: Sequelize.INTEGER,
  },
  phase: Sequelize.STRING,
  assessment_rubric: Sequelize.JSON,
});

export const getAllAssessmentSlots = () => AssessmentSlots.findAll({});

export const getAssessmentSlotsByProgram = (program,
  cohort_duration) => AssessmentSlots.findAll(
  {
    order: [
      ['cohort_duration', 'ASC'],
      ['slot_order', 'ASC'],
      ['time_scheduled', 'ASC'],
    ],
    where: {
      program,
      cohort_duration,
    },
  },
);

export const getAssessmentSlotsByProgramDuration = (program,
  cohort_duration) => AssessmentSlots.findAll(
  { where: { program, cohort_duration } },
);

export const getAssessmentSlotsById = id => AssessmentSlots.findOne(
  { where: { id } },
);

export const createAssessmentSlots = (cohort_duration, program,
  assessment_day, time_scheduled, reviewer, week, assessment_duration,
  slot_order, phase) => AssessmentSlots.create(
  {
    cohort_duration,
    assessment_day,
    program,
    time_scheduled,
    reviewer,
    week,
    assessment_duration,
    slot_order,
    phase,
    created_at: Sequelize.literal('NOW()'),
  },
);

export const updateAssessmentSlots = (id, assessment_day,
  time_scheduled, reviewer, week, assessment_duration,
  slot_order) => AssessmentSlots.update({
  assessment_day,
  time_scheduled,
  reviewer,
  week,
  assessment_duration,
  slot_order,
}, { where: { id } });

export const deleteAssessmentSlot = (id) => AssessmentSlots.destroy(
  { where: { id } },
);
