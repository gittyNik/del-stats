import {
  getAllRecordings, getRecordingsById, getRecordingsByCatalyst,
  createRecordingEntry, updateRecordings
} from '../../models/breakout_recordings';


export const getAllRecordingsAPI = (req, res) => {
  const { skip, limit, sort_by } = req.query;
  getAllRecordings(skip, limit, sort_by).then((data) => { res.json(data); })
    .catch(err => res.status(500).send(err));
};

export const getRecordingsByCatalystAPI = (req, res) => {
  const { skip, limit, sort_by } = req.query;
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
  } = req.body;
  createRecordingEntry(catalyst_id,
    recording_url,
    recording_details).then((data) => { res.json(data); })
    .catch(err => res.status(500).send(err));
};


export const updateRecordingsAPI = (req, res) => {
  const {
    likes, recording_details,
  } = req.body;
  const { id } = req.params;
  updateRecordings(id, likes, recording_details).then((data) => { res.json(data); })
    .catch(err => res.status(500).send(err));
};
