import {
  getAllLikesRating, getVideoLikesRating, getVideoLikedByUser,
  getVideoByCatalyst, createRecordingEntry, updateRecordingDetails,
} from '../../models/breakout_recording_details';

export const getAllRecordingsAPI = (req, res) => {
  let { skip, limit, sort_by } = req.query;
  if (typeof skip !== 'undefined') {
    skip = parseInt(skip, 10);
  }
  if (typeof limit !== 'undefined') {
    limit = parseInt(limit, 10);
  }
  getAllLikesRating(skip, limit, sort_by).then((data) => { res.json(data); })
    .catch(err => {
      console.error(err);
      res.status(500).send(err);
    });
};

export const getVideoLikesRatingAPI = (req, res) => {
  let { skip, limit, sort_by } = req.query;
  let { id } = req.params;
  if (typeof skip !== 'undefined') {
    skip = parseInt(skip, 10);
  }
  if (typeof limit !== 'undefined') {
    limit = parseInt(limit, 10);
  }
  getVideoLikesRating(id, skip, limit, sort_by).then((data) => { res.json(data); })
    .catch(err => res.status(500).send(err));
};

export const getVideoLikedByUserAPI = (req, res) => {
  let { skip, limit, sort_by } = req.query;
  const user_id = req.jwtData.user.id;
  if (typeof skip !== 'undefined') {
    skip = parseInt(skip, 10);
  }
  if (typeof limit !== 'undefined') {
    limit = parseInt(limit, 10);
  }
  getVideoLikedByUser(user_id, skip, limit, sort_by).then((data) => { res.json(data); })
    .catch(err => res.status(500).send(err));
};

export const getVideoByCatalystAPI = (req, res) => {
  let { skip, limit, sort_by } = req.query;
  let { catalyst_id } = req.params;
  if (typeof skip !== 'undefined') {
    skip = parseInt(skip, 10);
  }
  if (typeof limit !== 'undefined') {
    limit = parseInt(limit, 10);
  }
  getVideoByCatalyst(catalyst_id, skip, limit, sort_by).then((data) => { res.json(data); })
    .catch(err => res.status(500).send(err));
};

export const createRecording = (req, res) => {
  const {
    catalyst_id,
    recording_url,
    recording_details,
    topics,
    breakout_template_id,
    cohort_breakout_id,
  } = req.body;
  createRecordingEntry(
    catalyst_id,
    recording_url,
    recording_details,
    topics,
    breakout_template_id,
    cohort_breakout_id,
  )
    .then((data) => { res.json(data); })
    .catch(err => {
      console.log(err);
      res.status(500).send(err);
    });
};

export const updateRecordingsAPI = (req, res) => {
  const {
    breakout_rating, likedByUser,
  } = req.body;
  const user_id = req.jwtData.user.id;
  const { id } = req.params;
  updateRecordingDetails(id, likedByUser, breakout_rating,
    user_id).then((data) => { res.json(data); })
    .catch(err => res.status(500).send(err));
};
