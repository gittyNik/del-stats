import Sequelize from 'sequelize';
import db from '../database';

export const ReviewSlots = db.define('review_slots', {
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
  review_day: {
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
    allowNull: false,
  },
});

export const getAllReviewSlots = () => ReviewSlots.findAll({});

export const getReviewSlotsByProgram = (program) => ReviewSlots.findAll(
  { where: { program } },
);

export const getReviewSlotsByProgramDuration = (program, cohort_duration) => ReviewSlots.findAll(
  { where: { program, cohort_duration } },
);

export const getReviewSlotsById = id => ReviewSlots.findOne(
  { where: { id } },
);

export const createReviewSlots = (cohort_duration, program,
  review_day, time_scheduled, reviewer) => ReviewSlots.create(
  {
    cohort_duration,
    review_day,
    program,
    time_scheduled,
    created_at: Date.now(),
    reviewer,
  },
);

export const updateReviewSlots = (id, review_day, time_scheduled, reviewer) => ReviewSlots.update({
  review_day, time_scheduled, reviewer,
}, { where: { id } });


export const deleteReviewSlot = (id) => ReviewSlots.destroy(
  { where: { id } },
);
