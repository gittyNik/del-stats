import {
  getAllBreakoutTemplates,
  getBreakoutTemplateById,
  createBreakoutTemplate, updateBreakoutTemplate,
  deleteBreakoutTemplate,
} from '../../models/breakout_template';


export const getAllBreakoutTemplatesAPI = (req, res) => {
  getAllBreakoutTemplates().then((data) => { res.json(data); })
    .catch(err => res.status(500).send(err));
};

export const getBreakoutTemplateByIdAPI = (req, res) => {
  const { id } = req.params;

  getBreakoutTemplateById(id).then((data) => { res.json(data); })
    .catch(err => res.status(500).send(err));
};

export const createBreakoutTemplateAPI = (req, res) => {
  const {
    name,
    topic_id,
    mandatory,
    level,
    primary_catalyst,
    secondary_catalysts,
    details,
    duration,
    time_scheduled,
    after_days,
    updated_by,
    cohort_duration,
    program_id,
  } = req.body;
  const user_id = req.jwtData.user.id;

  createBreakoutTemplate(name,
    topic_id,
    mandatory,
    level,
    primary_catalyst,
    secondary_catalysts,
    details,
    duration,
    time_scheduled,
    after_days,
    updated_by,
    cohort_duration,
    program_id,
    user_id).then((data) => { res.json(data); })
    .catch(err => res.status(500).send(err));
};

export const updateBreakoutTemplateAPI = (req, res) => {
  const {
    name,
    topic_id,
    mandatory,
    level,
    primary_catalyst,
    secondary_catalysts,
    details,
    duration,
    time_scheduled,
    after_days,
    cohort_duration,
    program_id,
  } = req.body;
  const { id } = req.params;
  const user_id = req.jwtData.user.id;

  updateBreakoutTemplate(id,
    name,
    topic_id,
    mandatory,
    level,
    primary_catalyst,
    secondary_catalysts,
    details,
    duration,
    time_scheduled,
    after_days,
    user_id,
    cohort_duration,
    program_id).then((data) => { res.json(data); })
    .catch(err => res.status(500).send(err));
};

export const deleteBreakoutTemplateAPI = (req, res) => {
  const { id } = req.params;

  deleteBreakoutTemplate(id).then((data) => { res.json(data); })
    .catch(err => res.status(500).send(err));
};
