import {
  getAllRubrics,
  getRubricsById, getRubricsByProgram,
  createRubrics, updateRubrics,
  deleteRubric,
} from '../../models/rubrics';

export const getAllRubricsAPI = (req, res) => {
  getAllRubrics().then((data) => { res.json(data); })
    .catch(err => res.status(500).send(err));
};

export const getRubricsByIdAPI = (req, res) => {
  const { id } = req.params;

  getRubricsById(id).then((data) => { res.json(data); })
    .catch(err => res.status(500).send(err));
};

export const getRubricsByProgramAPI = (req, res) => {
  const { program, type } = req.params;

  getRubricsByProgram(program, type).then((data) => { res.json(data); })
    .catch(err => res.status(500).send(err));
};

export const createRubricsAPI = (req, res) => {
  const {
    milestone_id,
    rubric_name,
    program,
    rubric_parameters,
    type,
  } = req.body;

  createRubrics(milestone_id, rubric_name,
    program, rubric_parameters, type).then((data) => { res.json(data); })
    .catch(err => res.status(500).send(err));
};

export const updateRubricsAPI = (req, res) => {
  const {
    rubric_parameters,
  } = req.body;
  const { id } = req.params;

  updateRubrics(id, rubric_parameters).then((data) => { res.json(data); })
    .catch(err => res.status(500).send(err));
};

export const deleteRubricAPI = (req, res) => {
  const { id } = req.params;

  deleteRubric(id).then((data) => { res.json(data); })
    .catch(err => res.status(500).send(err));
};
