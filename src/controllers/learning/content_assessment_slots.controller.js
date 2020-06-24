import {
  getAllAssessmentSlots,
  getAssessmentSlotsById, getAssessmentSlotsByProgram,
  createAssessmentSlots, updateAssessmentSlots,
  deleteAssessmentSlot,
} from '../../models/assessment_slots';

export const getAllAssessmentSlotsAPI = (req, res) => {
  getAllAssessmentSlots().then((data) => { res.json(data); })
    .catch(err => res.status(500).send(err));
};

export const getAssessmentSlotsByIdAPI = (req, res) => {
  const { id } = req.params;

  getAssessmentSlotsById(id).then((data) => { res.json(data); })
    .catch(err => res.status(500).send(err));
};

export const getAssessmentSlotsByProgramAPI = (req, res) => {
  const { program } = req.params;

  getAssessmentSlotsByProgram(program).then((data) => { res.json(data); })
    .catch(err => res.status(500).send(err));
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
    assessment_duration, slot_order, phase).then((data) => { res.json(data); })
    .catch(err => res.status(500).send(err));
};

export const updateAssessmentSlotsAPI = (req, res) => {
  const {
    assessment_day, time_scheduled, reviewer, week, assessment_duration,
    slot_order,
  } = req.body;
  const { id } = req.params;

  updateAssessmentSlots(id, assessment_day,
    time_scheduled, reviewer, week,
    assessment_duration, slot_order).then((data) => { res.json(data); })
    .catch(err => res.status(500).send(err));
};

export const deleteAssessmentSlotAPI = (req, res) => {
  const { id } = req.params;

  deleteAssessmentSlot(id).then((data) => { res.json(data); })
    .catch(err => res.status(500).send(err));
};
