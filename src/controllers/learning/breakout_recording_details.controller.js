import {
  getAllLikesRating, getVideoLikesRating, getVideoLikedByUser,
  getVideoByCatalyst, createRecordingEntry, updateRecordingDetails,
  getAverageStatsCatalyst,
} from '../../models/breakout_recording_details';

export const getAllRecordingsAPI = (req, res) => {
  let { skip, limit, sort_by } = req.query;
  if (typeof skip !== 'undefined') {
    skip = parseInt(skip, 10);
  }
  if (typeof limit !== 'undefined') {
    limit = parseInt(limit, 10);
  }
  getAllLikesRating(skip, limit, sort_by).then((data) => {
    res.status(200).json({
      message: 'Fetch Breakout details',
      data,
      type: 'success',
    });
  })
    .catch(err => {
      console.error(err);
      res.status(500).send(err);
    });
};

export const getVideoLikesRatingAPI = (req, res) => {
  let { sort_by } = req.query;
  const user_id = req.jwtData.user.id;
  let { id } = req.params;

  getVideoLikesRating(id, user_id, sort_by).then((data) => { res.json(data); })
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
  let { id } = req.params;
  if (typeof skip !== 'undefined') {
    skip = parseInt(skip, 10);
  }
  if (typeof limit !== 'undefined') {
    limit = parseInt(limit, 10);
  }
  getVideoByCatalyst({
    catalyst_id: id, skip, limit, sort_by,
  }).then((data) => { res.json(data); })
    .catch(err => res.status(500).send(err));
};

export const getAverageStatsCatalystAPI = (req, res) => {
  let { skip, limit, sort_by } = req.query;
  let { id } = req.params;
  if (typeof skip !== 'undefined') {
    skip = parseInt(skip, 10);
  }
  if (typeof limit !== 'undefined') {
    limit = parseInt(limit, 10);
  }
  getAverageStatsCatalyst({
    catalyst_id: id, skip, limit, sort_by,
  }).then((data) => {
    if (data.length > 0) {
      res.status(200).json({
        message: 'Catalyst stats fetched',
        data: data[0],
        type: 'success',
      });
    } else {
      res.status(400).json({
        message: 'Catalyst stats not found',
        type: 'success',
      });
    }
  })
    .catch(err => res.status(500).send(err));
};

export const createRecording = (req, res) => {
  const {
    video_id,
    liked_by_user,
    breakout_rating,
  } = req.body;
  const user_id = req.jwtData.user.id;
  createRecordingEntry(
    video_id,
    liked_by_user,
    user_id,
    breakout_rating,
  )
    .then((data) => { res.json(data); })
    .catch(err => {
      console.log(err);
      res.status(500).send(err);
    });
};

export const updateRecordingsAPI = (req, res) => {
  const {
    breakout_rating, liked_by_user, video_id,
  } = req.body;
  const user_id = req.jwtData.user.id;
  updateRecordingDetails(video_id, liked_by_user, breakout_rating,
    user_id).then((data) => { res.json(data); })
    .catch(err => res.status(500).send(err));
};
