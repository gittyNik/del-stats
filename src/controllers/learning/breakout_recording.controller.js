import {
  getAllRecordings, getRecordingsById, getRecordingsByCatalyst,
  createRecordingEntry, updateRecordings,
} from '../../models/breakout_recordings';


export const getAllRecordingsAPI = (req, res) => {
  let { skip, limit, sort_by } = req.query;
  if (typeof skip !== 'undefined') {
    skip = parseInt(skip, 10);
  }
  if (typeof limit !== 'undefined') {
    limit = parseInt(limit, 10);
  }
  getAllRecordings(skip, limit, sort_by).then((data) => { res.json(data); })
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
  } = req.body;
  createRecordingEntry(catalyst_id,
    recording_url,
    recording_details,
    topics).then((data) => { res.json(data); })
    .catch(err => res.status(500).send(err));
};


export const updateRecordingsAPI = (req, res) => {
  const {
    likes, recording_details, views,
  } = req.body;
  const { id } = req.params;
  updateRecordings(id, likes, recording_details, views).then((data) => { res.json(data); })
    .catch(err => res.status(500).send(err));
};
