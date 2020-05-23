import Express from 'express';
import {
  getAllRecordingsAPI, getRecordingsByCatalystAPI, getRecordingsByIdAPI,
  createRecording, updateRecordingsAPI, getVideoUrl,
} from '../../controllers/learning/breakout_recording.controller';
import { allowMultipleRoles, allowAdminsOnly } from '../../controllers/auth/roles.controller';
import { USER_ROLES } from '../../models/user';

const {
  ADMIN, CATALYST, EDUCATOR,
} = USER_ROLES;

const router = Express.Router();

router.use(allowMultipleRoles([ADMIN, CATALYST, EDUCATOR]));

/**
 * @api {get} /learning/content/breakouts/recordings Get all Content Breakouts recordings
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
 * @api {get} /learning/content/breakouts/recordings/:id Get all Content Breakouts recordings
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
 * @api {get} /learning/content/breakouts/recordings/:id/video Get Video of recording
 * @apiDescription get Video recordings
 * @apiHeader {String} authorization JWT Token.
 * @apiName GetContentBreakouts
 * @apiGroup ContentBreakoutsRecordings
 */
router.get('/:id/video', getVideoUrl);

/**
 * @api {get} /learning/content/breakouts/recordings/catalyst/:id
 * Get all Content Breakouts recordings for Catalyst
 * @apiDescription get all Content Breakouts recordings
 * @apiHeader {String} authorization JWT Token.
 * @apiName GetContentBreakouts
 * @apiGroup ContentBreakoutsRecordings
 */
router.get('/catalyst/:id', getRecordingsByCatalystAPI);

// Restrict modifications for any applicant to the cohorts
router.use(allowAdminsOnly);

/**
 * @api {post} /learning/content/breakouts/recordings/ Insert Breakout recording
 * @apiDescription get all Content Breakouts recordings
 * @apiHeader {String} authorization JWT Token.
 * @apiName GetContentBreakouts
 * @apiGroup ContentBreakoutsRecordings
 * @apiParam {catalyst_id} Id of Catalyst taking recording
 * @apiParam {recording_url} Url of the recoring
 * @apiParam {recording_details} Details of the recording
 * @apiParam {topics} Array of topics for Breakout
 */
router.post('/', createRecording);

/**
 * @api {patch} /learning/content/breakouts/recordings/:id Update Breakout recording
 * @apiDescription get all Content Breakouts recordings
 * @apiHeader {String} authorization JWT Token.
 * @apiName GetContentBreakouts
 * @apiGroup ContentBreakoutsRecordings
 * @apiParam {id} Id of Recording
 * @apiParam {likes} likes count of likes on video
 * @apiParam {recording_details} recording details
 */
router.patch('/:id', updateRecordingsAPI);

export default router;