import {
  getAllReviewSlots,
  getReviewSlotsById, getReviewSlotsByProgram,
  createReviewSlots, updateReviewSlots,
  deleteReviewSlot,
} from '../../models/review_slots';


export const getAllReviewSlotsAPI = (req, res) => {
  getAllReviewSlots().then((data) => { res.json(data); })
    .catch(err => res.status(500).send(err));
};

export const getReviewSlotsByIdAPI = (req, res) => {
  const { id } = req.params;

  getReviewSlotsById(id).then((data) => { res.json(data); })
    .catch(err => res.status(500).send(err));
};

export const getReviewSlotsByProgramAPI = (req, res) => {
  const { program } = req.params;

  getReviewSlotsByProgram(program).then((data) => { res.json(data); })
    .catch(err => res.status(500).send(err));
};

export const createReviewSlotsAPI = (req, res) => {
  const {
    milestone_id,
    rubric_name,
    program,
    rubric_parameters,
  } = req.body;

  createReviewSlots(milestone_id, rubric_name,
    program, rubric_parameters).then((data) => { res.json(data); })
    .catch(err => res.status(500).send(err));
};

export const updateReviewSlotsAPI = (req, res) => {
  const {
    rubric_parameters,
  } = req.body;
  const { id } = req.params;

  updateReviewSlots(id, rubric_parameters).then((data) => { res.json(data); })
    .catch(err => res.status(500).send(err));
};

export const deleteReviewSlotAPI = (req, res) => {
  const { id } = req.params;

  deleteReviewSlot(id).then((data) => { res.json(data); })
    .catch(err => res.status(500).send(err));
};
