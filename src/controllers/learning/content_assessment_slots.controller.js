import {
  getAllAssessmentSlots,
  getAssessmentSlotsById, getAssessmentSlotsByProgram,
  createAssessmentSlots, updateAssessmentSlots,
  deleteAssessmentSlot,
} from '../../models/assessment_slots';
import logger from '../../util/logger';

export const getAllAssessmentSlotsAPI = (req, res) => {
  getAllAssessmentSlots().then((data) => { res.json(data); })
    .catch((err) => {
      logger.error(err);
      return res.status(500);
    });
};

export const getAssessmentSlotsByIdAPI = (req, res) => {
  const { id } = req.params;

  getAssessmentSlotsById(id).then((data) => { res.json(data); })
    .catch((err) => {
      logger.error(err);
      return res.status(500);
    });
};

export const getAssessmentSlotsByProgramAPI = (req, res) => {
  const { program } = req.params;

  getAssessmentSlotsByProgram(program).then((data) => { res.json(data); })
    .catch((err) => {
      logger.error(err);
      return res.status(500);
    });
};

export const createAssessmentSlotsAPI = (req, res) => {
  const {
    cohort_duration, program,
    assessment_day, time_scheduled,
    reviewer, week, assessment_duration,
    slot_order, phase,
  } = req.body;

  createAssessmentSlots(cohort_duration, program,
    assessment_day, time_scheduled, reviewer, week,
    assessment_duration, slot_order, phase).then((data) => res.status(201).json({
    message: 'Created assessment slots',
    data,
    type: 'success',
  }))
    .catch((err) => {
      logger.error(err);
      return res.status(500);
    });
};

export const updateAssessmentSlotsAPI = (req, res) => {
  const {
    assessment_day, time_scheduled, reviewer, week, assessment_duration,
    slot_order, cohort_duration,
  } = req.body;
  const { id } = req.params;

  updateAssessmentSlots({
    id,
    assessment_day,
    time_scheduled,
    reviewer,
    week,
    assessment_duration,
    slot_order,
    cohort_duration,
  }).then((data) => res.status(200).json({
    message: 'Updated assessment slots',
    data,
    type: 'success',
  }))
    .catch((err) => {
      logger.error(err);
      return res.status(500);
    });
};

export const deleteAssessmentSlotAPI = (req, res) => {
  const { id } = req.params;

  deleteAssessmentSlot(id).then((data) => res.status(201).json({
    message: 'Deleted assessment slots',
    data,
    type: 'success',
  }))
    .catch((err) => {
      logger.error(err);
      return res.status(500);
    });
};
