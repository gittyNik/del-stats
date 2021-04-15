import {
  getAllAssessments,
  getAssessmentById,
  getAssessmentsByStatus,
  getAssessmentsByUserId,
  updateStatusForTeam,
  createAssessmentEntry,
  addAssessmentsForTeam,
  getAssessmentsByTeam,
  createAssessmentSchedule,
  getUserAndTeamAssessments,
  updateAssessment,
} from '../../models/assessment';
import { getAssessmentPhases } from '../../models/topic';
import { getAssessmentCohorts } from '../../models/cohort_milestone';
import logger from '../../util/logger';

export const getAllAssessmentsAPI = (req, res) => {
  const { assessment_date } = req.query;

  getAllAssessments(assessment_date)
    .then((data) => {
      res.json(data);
    })
    .catch((err) => res.status(500).send(err));
};

export const getAssessmentsByStatusAPI = (req, res) => {
  const { status } = req.params;
  getAssessmentsByStatus(status)
    .then((data) => {
      res.json(data);
    })
    .catch((err) => res.status(500).send(err));
};

// Get assessments for a user
export const getAssessmentsByUserIdAPI = (req, res) => {
  const { user_id } = req.body;
  getAssessmentsByUserId(user_id)
    .then((data) => {
      res.json(data);
    })
    .catch((err) => res.status(500).send(err));
};

// Get assessments for a user and Team user for that user
export const getUserAndTeamAssessmentsAPI = (req, res) => {
  const { user_id } = req.body;
  getUserAndTeamAssessments(user_id)
    .then((data) => {
      res.json(data);
    })
    .catch((err) => res.status(500).send(err));
};

export const getAssessmentsByIdAPI = (req, res) => {
  const { id } = req.params;
  getAssessmentById(id)
    .then((data) => {
      res.json(data);
    })
    .catch((err) => res.status(500).send(err));
};

export const getAssessmentsByTeamAPI = (req, res) => {
  const { id } = req.params;
  getAssessmentsByTeam(id)
    .then((data) => {
      res.json(data);
    })
    .catch((err) => res.status(500).send(err));
};

export const createAssessment = (req, res) => {
  const {
    id,
    cohort_id,
    time_scheduled,
    duration,
    details,
    cohortName,
    team_feedback,
    catalyst_notes,
    catalyst_id,
  } = req.body;
  createAssessmentEntry(
    id,
    cohort_id,
    time_scheduled,
    duration,
    details,
    cohortName,
    team_feedback,
    catalyst_notes,
    catalyst_id,
  )
    .then((data) => {
      res.json(data);
    })
    .catch((err) => res.status(500).send(err));
};

export const addAssessmentsForTeamAPI = (req, res) => {
  const {
    learner_feedbacks,
    status,
    team_feedback,
    additional_details,
  } = req.body;
  const { id } = req.params;
  addAssessmentsForTeam(
    id,
    learner_feedbacks,
    status,
    team_feedback,
    additional_details,
  )
    .then((data) => {
      res.json(data);
    })
    .catch((err) => res.status(500).send(err));
};

export const updateStatusForTeamAPI = (req, res) => {
  const { status } = req.body;
  const { id } = req.params;
  updateStatusForTeam(id, status)
    .then((data) => {
      res.json(data);
    })
    .catch((err) => res.status(500).send(err));
};

export const createAssessmentScheduleAPI = (req, res) => {
  const {
    program,
    cohort_duration,
    cohort_ids,
    assessment_start,
    phase,
    excluded_learners,
  } = req.body;
  createAssessmentSchedule(
    program,
    cohort_duration,
    cohort_ids,
    assessment_start,
    phase,
    excluded_learners,
  )
    .then((data) => {
      res.json(data);
    })
    .catch((err) => {
      logger.error(err);
      res.status(500).send(err);
    });
};

export const updateAssessmentForLearnerAPI = (req, res) => {
  const { assessment_feedback, learner_feedback } = req.body;

  const { learner_id, id } = req.params;

  updateAssessment(assessment_feedback, learner_id, id, learner_feedback)
    .then((data) => {
      res.json(data);
    })
    .catch((err) => res.status(500).send(err));
};

export const getAssessmentPhasesAPI = (req, res) => {
  const { program, duration } = req.query;
  console.log(req.query);

  getAssessmentPhases(program, duration)
    .then((phases) => res.status(200).send({
      message: 'Get all Phases Successful!',
      data: phases,
      type: 'success',
    }))
    .catch((e) => {
      logger.error(e);
      return res.status(500).send(e);
    });
};

export const getAssessmentCohortsAPI = async (req, res) => {
  try {
    const { milestone, duration, program } = req.query;
    const data = await getAssessmentCohorts(milestone, duration, program);

    return res.status(200).send({
      message: 'Get all Cohorts for specific Assessment Successful!',
      data,
      type: 'success',
    });
  } catch (e) {
    logger.error(e);
    return res.status(500).send({
      message: 'Get all Cohorts for specific Assessment Failed!',
      data: e,
      type: 'failure',
    });
  }
};
