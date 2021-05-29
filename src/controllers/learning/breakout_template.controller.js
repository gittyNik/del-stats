import {
  getAllBreakoutTemplates,
  getBreakoutTemplateById,
  createBreakoutTemplate, updateBreakoutTemplate,
  deleteBreakoutTemplate,
} from '../../models/breakout_template';
import logger from '../../util/logger';

export const getAllBreakoutTemplatesAPI = (req, res) => {
  getAllBreakoutTemplates().then((data) => { res.json(data); })
    .catch(err => {
      logger.error(err);
      res.status(500).send(err);
    });
};

export const getBreakoutTemplateByIdAPI = (req, res) => {
  const { id } = req.params;

  getBreakoutTemplateById(id).then((data) => { res.json(data); })
    .catch(err => {
      logger.error(err);
      res.status(500);
    });
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
    cohort_duration,
    program_id,
    status,
    catalyst_breakout,
    assign_primary_catalyst,
  } = req.body;
  const { user } = req.jwtData;

  createBreakoutTemplate(
    {
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
      user,
      status,
      catalyst_breakout,
      assign_primary_catalyst,
    },
  ).then((data) => {
    res.status(201).json({
      message: 'Breakout template created',
      data,
      type: 'success',
    });
  })
    .catch(err => {
      logger.error(err);
      res.status(500).send(err);
    });
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
    status,
    catalyst_breakout,
    assign_primary_catalyst,
  } = req.body;
  const { id } = req.params;
  const { user } = req.jwtData;

  updateBreakoutTemplate(
    {
      id,
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
      user,
      cohort_duration,
      program_id,
      status,
      catalyst_breakout,
      assign_primary_catalyst,
    },
  ).then((data) => {
    res.status(200).json({
      message: 'Breakout template updated',
      data,
      type: 'success',
    });
  })
    .catch(err => {
      logger.error(err);
      res.status(500);
    });
};

export const deleteBreakoutTemplateAPI = (req, res) => {
  const { id } = req.params;

  deleteBreakoutTemplate(id).then((data) => {
    res.status(200).json({
      message: 'Breakout template deleted',
      data,
      type: 'success',
    });
  })
    .catch(err => {
      logger.error(err);
      res.status(500);
    });
};
