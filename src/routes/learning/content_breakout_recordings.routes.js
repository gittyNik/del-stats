import Express from 'express';
import {
  getAllRecordingsAPI, getRecordingsByCatalystAPI, getRecordingsByIdAPI,
  createRecording, updateRecordingsAPI,
} from '../../controllers/learning/breakout_recording.controller';

const router = Express.Router();

/**
 * @api {get} /learning/content/breakout/recordings Get all Content Breakouts recordings
 * @apiDescription get all Content Breakouts recordings
 * @apiHeader {String} authorization JWT Token.
 * @apiName GetContentBreakouts
 * @apiGroup ContentBreakoutsRecordings
 * @apiParam {skip} skip number of records
 * @apiParam {limit} limit number of records
 * @apiParam {sort_by} sort_by values - [likes, views, created_at]
 */
router.get('/', getAllRecordingsAPI);

/**
 * @api {get} /learning/content/breakout/recordings/:id Get all Content Breakouts recordings
 * @apiDescription get all Content Breakouts recordings
 * @apiHeader {String} authorization JWT Token.
 * @apiName GetContentBreakouts
 * @apiGroup ContentBreakoutsRecordings
 * @apiParam {skip} skip number of records
 * @apiParam {limit} limit number of records
 * @apiParam {sort_by} sort_by values - [likes, views, created_at]
 */
router.get('/:id', getRecordingsByIdAPI);

/**
 * @api {post} /learning/content/breakout/recordings/ Insert Breakout recording
 * @apiDescription get all Content Breakouts recordings
 * @apiHeader {String} authorization JWT Token.
 * @apiName GetContentBreakouts
 * @apiGroup ContentBreakoutsRecordings
 * @apiParam {catalyst_id} Id of Catalyst taking recording
 * @apiParam {recording_url} Url of the recoring
 * @apiParam {recording_details} Details of the recording
 */
router.post('/', createRecording);

/**
 * @api {patch} /learning/content/breakout/recordings/:id Update Breakout recording
 * @apiDescription get all Content Breakouts recordings
 * @apiHeader {String} authorization JWT Token.
 * @apiName GetContentBreakouts
 * @apiGroup ContentBreakoutsRecordings
 * @apiParam {id} Id of Recording
 * @apiParam {likes} likes count of likes on video
 * @apiParam {recording_details} recording details
 */
router.patch('/:id', updateRecordingsAPI);

/**
 * @api {get} /learning/content/breakout/recordings/catalyst/:id
 * Get all Content Breakouts recordings for Catalyst
 * @apiDescription get all Content Breakouts recordings
 * @apiHeader {String} authorization JWT Token.
 * @apiName GetContentBreakouts
 * @apiGroup ContentBreakoutsRecordings
 */
router.get('/catalyst/:id', getRecordingsByCatalystAPI);
