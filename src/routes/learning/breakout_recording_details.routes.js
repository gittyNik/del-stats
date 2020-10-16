import Express from 'express';
import {
  getAllRecordingsAPI, getVideoLikesRatingAPI, getVideoByCatalystAPI,
  createRecording, updateRecordingsAPI, getVideoLikedByUserAPI,
} from '../../controllers/learning/breakout_recording_details.controller';
import { allowMultipleRoles } from '../../controllers/auth/roles.controller';
import { USER_ROLES } from '../../models/user';

const {
  ADMIN, CATALYST, EDUCATOR, LEARNER, REVIEWER,
} = USER_ROLES;

const router = Express.Router();

router.use(allowMultipleRoles([ADMIN, CATALYST, EDUCATOR, LEARNER, REVIEWER]));

/**
 * @api {get} /learning/content/breakouts/recordings/details Get all Content Breakouts recordings
 * @apiDescription get all Content Breakouts recordings
 * @apiHeader {String} authorization JWT Token.
 * @apiName GetContentBreakouts
 * @apiGroup ContentBreakoutsRecordings
 * @apiParam {skip} skip number of records
 * @apiParam {limit} limit number of records
 * @apiParam {sort_by} sort_by values - [likes, views, created_at]
 */
router.get('/all', getAllRecordingsAPI);

/**
 * @api {get} /learning/content/breakouts/recordings/catalyst/:id
 * Get all Content Breakouts recordings for Catalyst
 * @apiDescription get all Content Breakouts recordings
 * @apiHeader {String} authorization JWT Token.
 * @apiName GetContentBreakouts
 * @apiGroup ContentBreakoutsRecordings
 */
router.get('/liked-by-user', getVideoLikedByUserAPI);

/**
 * @api {get} /learning/content/breakouts/recordings/details/:id Get all Content Breakouts
 * recordings
 * @apiDescription get all Content Breakouts recordings
 * @apiHeader {String} authorization JWT Token.
 * @apiName GetContentBreakouts
 * @apiGroup ContentBreakoutsRecordings
 * @apiParam {skip} skip number of records
 * @apiParam {limit} limit number of records
 * @apiParam {sort_by} sort_by values - [likes, views, created_at]
 */
router.get('/:id', getVideoLikesRatingAPI);

/**
 * @api {get} /learning/content/breakouts/recordings/details/catalyst/:id
 * Get all Content Breakouts recordings for Catalyst
 * @apiDescription get all Content Breakouts recordings
 * @apiHeader {String} authorization JWT Token.
 * @apiName GetContentBreakouts
 * @apiGroup ContentBreakoutsRecordings
 */
router.get('/catalyst/:id', getVideoByCatalystAPI);

// Restrict modifications for any applicant to the cohorts

/**
 * @api {post} /learning/content/breakouts/recordings/details/create Insert Breakout recording
 * @apiDescription get all Content Breakouts recordings
 * @apiHeader {String} authorization JWT Token.
 * @apiName GetContentBreakouts
 * @apiGroup ContentBreakoutsRecordings
 * @apiParam {catalyst_id} Id of Catalyst taking recording
 * @apiParam {recording_url} Url of the recoring
 * @apiParam {recording_details} Details of the recording
 * @apiParam {topics} Array of topics for Breakout
 */
router.post('/create', createRecording);

/**
 * @api {patch} /learning/content/breakouts/recordings/details/update Update Breakout recording
 * @apiDescription get all Content Breakouts recordings
 * @apiHeader {String} authorization JWT Token.
 * @apiName GetContentBreakouts
 * @apiGroup ContentBreakoutsRecordings
 * @apiParam {id} Id of Recording
 * @apiParam {likes} likes count of likes on video
 * @apiParam {recording_details} recording details
 */
router.patch('/update', updateRecordingsAPI);

export default router;
