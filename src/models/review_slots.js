import Sequelize from 'sequelize';
import db from '../database';
import { User, getUserName } from './user';
import cache from '../cache';
import logger from '../util/logger';

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
    allowNull: true,
  },
  week: {
    type: Sequelize.INTEGER,
    defaultValue: 0,
  },
  review_duration: {
    type: Sequelize.INTEGER,
  },
  slot_order: {
    type: Sequelize.INTEGER,
  },
});

export const getAllReviewSlots = async () => {
  let allReviewSlots;
  const cachedSlots = await cache.get('REVIEW_SLOTS');
  if (cachedSlots === null) {
    let reviewSlots = await ReviewSlots.findAll({
      include: [{
        model: User,
        attributes: [['name', 'reviewer']],
      }],
      raw: true,
    });

    allReviewSlots = await Promise.all(reviewSlots.map(async eachSlot => {
      let cohortDuration;
      if (eachSlot.cohort_duration >= 26) {
        cohortDuration = 'Part-time';
      } else {
        cohortDuration = 'Full-time';
      }
      eachSlot.review_duration /= 60000;
      eachSlot.cohortDuration = cohortDuration;
      return eachSlot;
    }));
    await cache.set('REVIEW_SLOTS', JSON.stringify(allReviewSlots), 'EX', 604800);
  } else {
    allReviewSlots = JSON.parse(cachedSlots);
  }
  return allReviewSlots;
};

export const getReviewSlotsByProgram = (program, cohort_duration) => ReviewSlots.findAll(
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
    raw: true,
  },
);

export const getReviewSlotsByProgramDuration = (program, cohort_duration) => ReviewSlots.findAll(
  { where: { program, cohort_duration } },
);

export const getReviewSlotsById = id => ReviewSlots.findOne(
  { where: { id } },
);

export const createReviewSlots = async (cohort_duration, program,
  review_day, time_scheduled, reviewer, week, review_duration,
  slot_order) => {
  try {
    await cache.del('REVIEW_SLOTS');
  } catch (err) {
    logger.warn('Cannot find key in Redis');
  }
  return ReviewSlots.create(
    {
      cohort_duration,
      review_day,
      program,
      time_scheduled,
      reviewer,
      week,
      review_duration,
      slot_order,
      created_at: Sequelize.literal('NOW()'),
    },
  );
};

export const updateReviewSlots = async ({
  id, review_day,
  time_scheduled, reviewer, week, review_duration,
  slot_order, cohort_duration,
}) => {
  try {
    await cache.del('REVIEW_SLOTS');
  } catch (err) {
    logger.warn('Cannot find key in Redis');
  }
  let review_slots = await ReviewSlots.update({
    review_day,
    time_scheduled,
    reviewer,
    week,
    review_duration,
    slot_order,
    cohort_duration,
  }, { where: { id }, returning: true, plain: true });

  let reviewSlots;
  try {
    reviewSlots = review_slots[1].toJSON();
    let user_id = reviewSlots.reviewer;
    let userDetails = await getUserName(user_id);
    reviewSlots['user.reviewer'] = userDetails.name;
  } catch (err) {
    logger.error('Unable to fetch reviewer');
  }
  return reviewSlots;
};

export const deleteReviewSlot = async (id) => {
  try {
    await cache.del('REVIEW_SLOTS');
  } catch (err) {
    logger.warn('Cannot find key in Redis');
  }
  return ReviewSlots.destroy(
    { where: { id } },
  );
};
