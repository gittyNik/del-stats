import { getCohortFromLearnerId } from '../../models/cohort';
import {
  getAllReviews, getReviewsById,
  getReviewsByStatus, getReviewsByUserId,
  updateStatusForTeam, createReviewEntry,
  addReviewsForTeam, getReviewsByTeam,
  createReviewSchedule,
  getUserAndTeamReviews,
  updateReviewForLearner,
  updateTeamReview,
  createCohortReviewSchedule,
  getCompletedReviewsForLearner,
} from '../../models/reviews';
import logger from '../../util/logger';

export const getAllReviewsAPI = (req, res) => {
  const { review_date } = req.query;

  getAllReviews(review_date).then((data) => { res.json(data); })
    .catch(err => res.status(500).send(err));
};

export const getReviewsByStatusAPI = (req, res) => {
  const { status } = req.params;
  getReviewsByStatus(status).then((data) => { res.json(data); })
    .catch(err => res.status(500).send(err));
};

// Get reviews for a user
export const getReviewsByUserIdAPI = (req, res) => {
  const { user_id } = req.body;
  getReviewsByUserId(user_id).then((data) => { res.json(data); })
    .catch(err => res.status(500).send(err));
};

// Get reviews for a user and Team user for that user
export const getUserAndTeamReviewsAPI = (req, res) => {
  const { user_id } = req.body;
  getUserAndTeamReviews(user_id).then((data) => { res.json(data); })
    .catch(err => res.status(500).send(err));
};

export const getReviewsByIdAPI = (req, res) => {
  const { id } = req.params;
  getReviewsById(id).then((data) => { res.json(data); })
    .catch(err => res.status(500).send(err));
};

export const getReviewsByTeamAPI = (req, res) => {
  const { id } = req.params;
  getReviewsByTeam(id).then((data) => { res.json(data); })
    .catch(err => res.status(500).send(err));
};

export const createReview = (req, res) => {
  const {
    id, cohort_id,
    time_scheduled, duration, details, cohortName, team_feedback,
    catalyst_notes, catalyst_id,
  } = req.body;
  createReviewEntry(id, cohort_id,
    time_scheduled, duration, details, cohortName, team_feedback,
    catalyst_notes, catalyst_id).then((data) => { res.json(data); })
    .catch(err => res.status(500).send(err));
};

export const addReviewsForTeamAPI = (req, res) => {
  const {
    learner_feedbacks, status, team_feedback,
    additional_details,
  } = req.body;
  const { id } = req.params;
  addReviewsForTeam(id,
    learner_feedbacks, status, team_feedback,
    additional_details).then((data) => { res.json(data); })
    .catch(err => res.status(500).send(err));
};

export const updateStatusForTeamAPI = (req, res) => {
  const {
    status,
  } = req.body;
  const { id } = req.params;
  updateStatusForTeam(id, status).then((data) => { res.json(data); })
    .catch(err => res.status(500).send(err));
};

export const createReviewScheduleAPI = (req, res) => {
  const { program, cohort_duration } = req.body;
  createReviewSchedule(program, cohort_duration).then((data) => { res.json(data); })
    .catch(err => {
      logger.error(err);
      res.status(500).send(err);
    });
};

export const createCohortReviewScheduleAPI = (req, res) => {
  const { program, cohort_duration, cohort_id } = req.body;
  createCohortReviewSchedule(program,
    cohort_duration, cohort_id).then((data) => { res.json(data); })
    .catch(err => {
      logger.error(err);
      res.status(500).send(err);
    });
};

export const updateReviewForLearnerAPI = (req, res) => {
  const {
    review_feedback,
    learner_feedback,
  } = req.body;

  const {
    id,
  } = req.params;
  updateReviewForLearner(review_feedback,
    learner_feedback, id).then((data) => { res.json(data); })
    .catch(err => res.status(500).send(err));
};

export const updateTeamReviewAPI = (req, res) => {
  const {
    team_feedback,
    attendance_count,
    catalyst_notes,
  } = req.body;

  const { id } = req.params;

  updateTeamReview(id,
    team_feedback,
    attendance_count,
    catalyst_notes).then((data) => { res.json(data); })
    .catch(err => res.status(500).send(err));
};

export const getCompletedReviewsForLearnerAPI = async (req, res) => {
  const { email } = req.params;
  const { status } = req.body;
  try {
    const data = await getCompletedReviewsForLearner(email, status);
    res.status(200).json({
      message: 'Reviews for a learner',
      type: 'success',
      data,
    });
  } catch (err) {
    logger.error(err);
    res.status(500).json({
      message: 'Error while fetching reviews for learner',
      type: 'failure',
      err,
    });
  }
};
