import {
  getAllBreakoutRecordings, getRecordingsById, getRecordingsByCatalyst,
  createRecordingEntry, updateRecordings, getRecordingVideoUrl,
} from '../../models/breakout_recordings';

export const getAllRecordingsAPI = (req, res) => {
  let {
    page, limit, sort_by, topics,
  } = req.query;
  let offset;
  if ((limit) && (page)) {
    offset = limit * (page - 1);
  }
  getAllBreakoutRecordings({
    offset, limit, sort_by, topics,
  }).then((response) => {
    res.json(response);
  })
    .catch(err => {
      console.error(`Error while fetching all breakouts: ${err}`);
      res.status(500);
    });
};

export const getVideoUrl = (req, res) => {
  const { id } = req.params;
  getRecordingVideoUrl(id).then((data) => {
    res.json(data);
  })
    .catch(err => res.status(500).send(err));
};

export const getRecordingsByCatalystAPI = (req, res) => {
  let { skip, limit, sort_by } = req.query;
  if (typeof skip !== 'undefined') {
    skip = parseInt(skip, 10);
  }
  if (typeof limit !== 'undefined') {
    limit = parseInt(limit, 10);
  }
  const { id } = req.params;
  getRecordingsByCatalyst(id, skip, limit, sort_by).then((data) => { res.json(data); })
    .catch(err => res.status(500).send(err));
};

export const getRecordingsByIdAPI = (req, res) => {
  const { id } = req.params;
  getRecordingsById(id).then((data) => { res.json(data); })
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
    likes, recording_details, views, breakout_template_id,
  } = req.body;
  const { id } = req.params;
  updateRecordings(id, likes, views,
    recording_details, breakout_template_id).then((data) => { res.json(data); })
    .catch(err => res.status(500).send(err));
};
