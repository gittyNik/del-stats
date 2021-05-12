import {
  getAllReviewSlots,
  getReviewSlotsById, getReviewSlotsByProgram,
  createReviewSlots, updateReviewSlots,
  deleteReviewSlot,
} from '../../models/review_slots';
import logger from '../../util/logger';

export const getAllReviewSlotsAPI = (req, res) => {
  getAllReviewSlots().then((data) => { res.json(data); })
    .catch(err => {
      logger.error('Error fetching all review slot: ', err);
      return res.status(500);
    });
};

export const getReviewSlotsByIdAPI = (req, res) => {
  const { id } = req.params;

  getReviewSlotsById(id).then((data) => { res.json(data); })
    .catch(err => {
      logger.error('Error fetching review slot by id: ', err);
      return res.status(500);
    });
};

export const getReviewSlotsByProgramAPI = (req, res) => {
  const { program } = req.params;

  getReviewSlotsByProgram(program).then((data) => { res.json(data); })
    .catch(err => {
      logger.error('Error fetching review slots by program: ', err);
      return res.status(500);
    });
};

export const createReviewSlotsAPI = (req, res) => {
  const {
    cohort_duration, program,
    review_day, time_scheduled,
    reviewer, week, review_duration,
    slot_order,
  } = req.body;

  createReviewSlots(cohort_duration, program,
    review_day, time_scheduled, reviewer, week,
    review_duration, slot_order).then((data) => res.status(201).json({
    message: 'Review slot created',
    data,
    type: 'success',
  }))
    .catch(err => {
      logger.error('Error creating review slot: ', err);
      return res.status(500);
    });
};

export const updateReviewSlotsAPI = (req, res) => {
  const {
    review_day, time_scheduled, reviewer, week, review_duration,
    slot_order,
  } = req.body;
  const { id } = req.params;

  updateReviewSlots(id, review_day,
    time_scheduled, reviewer, week,
    review_duration, slot_order).then((data) => res.status(200).json({
    message: 'Review slot updated',
    data,
    type: 'success',
  }))
    .catch(err => {
      logger.error('Error updating review slot: ', err);
      return res.status(500);
    });
};

export const deleteReviewSlotAPI = (req, res) => {
  const { id } = req.params;

  deleteReviewSlot(id).then((data) => res.status(200).json({
    message: 'Review slot deleted',
    data,
    type: 'success',
  }))
    .catch(err => {
      logger.error('Error deleting review slot: ', err);
      return res.status(500);
    });
};
