import Sequelize from 'sequelize';
import db from '../database';
import { User } from './user';
import { Topic } from './topic';

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
    defaultValue: 0,
  },
  assessment_duration: {
    type: Sequelize.INTEGER,
  },
  slot_order: {
    type: Sequelize.INTEGER,
  },
  phase: Sequelize.UUID,
  assessment_rubric: Sequelize.JSON,
});

export const getAllAssessmentSlots = async () => {
  let assessmentPhases = {};
  let assessmentSlots = await AssessmentSlots.findAll({
    include: [{
      model: User,
      attributes: [['name', 'reviewer']],
    }],
    raw: true,
  });
  let allAssessmentSlots = await Promise.all(assessmentSlots.map(async eachSlot => {
    let cohortDuration;
    let assessmentTopic;
    let { phase } = eachSlot;
    if (phase in assessmentPhases) {
      assessmentTopic = assessmentPhases[phase];
    } else {
      assessmentTopic = await Topic.findByPk(phase, {
        attributes: ['title'],
        raw: true,
      });
      assessmentPhases[phase] = assessmentTopic;
    }
    if (eachSlot.cohort_duration >= 26) {
      cohortDuration = 'Part-time';
    } else {
      cohortDuration = 'Full-time';
    }
    eachSlot.assessment_duration /= 60000;
    eachSlot.cohortDuration = cohortDuration;
    eachSlot.assessmentPhase = assessmentTopic;
    return eachSlot;
  }));
  return allAssessmentSlots;
};

export const getAssessmentSlotsByProgram = (program,
  cohort_duration, phase) => AssessmentSlots.findAll(
  {
    order: [
      ['cohort_duration', 'ASC'],
      ['slot_order', 'ASC'],
      ['time_scheduled', 'ASC'],
    ],
    where: {
      program,
      cohort_duration,
      phase,
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
