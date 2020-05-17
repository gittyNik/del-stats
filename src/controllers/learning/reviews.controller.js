import {
  getAllReviews, getReviewsById,
  getReviewsByStatus, getReviewsByUserId,
  updateStatusForTeam, createReviewEntry,
  addReviewsForTeam, getReviewsByTeam,
  createReviewSchedule,
  getUserAndTeamReviews,
} from '../../models/reviews';

export const getAllReviewsAPI = (req, res) => {
  getAllReviews().then((data) => { res.json(data); })
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
  const { review_id } = req.params;
  getReviewsById(review_id).then((data) => { res.json(data); })
    .catch(err => res.status(500).send(err));
};

export const getReviewsByTeamAPI = (req, res) => {
  const { id } = req.params;
  getReviewsByTeam(id).then((data) => { res.json(data); })
    .catch(err => res.status(500).send(err));
};

export const createReview = (req, res) => {
  const {
    id,
    milestone_name,
    status,
    scheduled_at,
    call_details,
    zoom_url,
  } = req.body;
  createReviewEntry(id,
    milestone_name,
    status,
    scheduled_at,
    call_details,
    zoom_url).then((data) => { res.json(data); })
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
  const { reviewSlots } = req.body;
  createReviewSchedule(reviewSlots).then((data) => { res.json(data); })
    .catch(err => res.status(500).send(err));
};
