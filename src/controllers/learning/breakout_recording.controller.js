import {
  getAllBreakoutRecordings, getRecordingsById, getRecordingsByCatalyst,
  createRecordingEntry, updateRecordings, getRecordingVideoUrl,
  BreakoutRecordings,
} from '../../models/breakout_recordings';
import {
  CohortBreakout,
} from '../../models/cohort_breakout';
import {
  BreakoutRecordingsDetails,
} from '../../models/breakout_recording_details';

import logger from '../../util/logger';

export const getAllRecordingsAPI = (req, res) => {
  let {
    page, limit, sort_by, topics,
  } = req.query;
  const user_id = req.jwtData.user.id;

  let offset;
  if ((limit) && (page)) {
    offset = limit * (page - 1);
  }
  getAllBreakoutRecordings({
    offset, limit, sort_by, topics, user_id,
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
      logger.error(err);
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

export const removeVideoPath = async ({ cohort_breakout_id }) => {
  const cohort_breakout = await CohortBreakout.findOne({
    where: { id: cohort_breakout_id },
  });

  if (!cohort_breakout || !cohort_breakout.details
    || !cohort_breakout.details || !cohort_breakout.details.recording
    || !cohort_breakout.details.recording.id) {
    throw Error('No recording found in cohort breakout details!');
  }

  const breakout_recording = await BreakoutRecordings.findOne({
    where: { id: cohort_breakout.details.recording.id },
  });
  if (!breakout_recording || !breakout_recording.id) {
    throw Error('breakout_recording not found but mentioned in cohort breakout!');
  }

  const breakout_recording_details = await BreakoutRecordingsDetails.findAll({
    where: { video_id: breakout_recording.id },
  });
  if (breakout_recording_details) {
    await BreakoutRecordingsDetails.destroy({
      where: { video_id: breakout_recording.id },
    });
  }

  await breakout_recording.destroy();

  const { recording, ...excludeRecording } = cohort_breakout.details;
  await CohortBreakout.update({
    details: excludeRecording,
  }, { where: { id: cohort_breakout_id } });

  return true;
};

export const removeVideoPathAPI = async (req, res) => {
  const cohort_breakout_id = req.params.id;
  try {
    const data = await removeVideoPath({ cohort_breakout_id });
    return res.status(201).json({ data, type: 'success', message: 'Removing video successful!' });
  } catch (e) {
    logger.error(e);
    return res.status(500).json({ type: 'failure', message: 'Removing Video failure!' });
  }
};
