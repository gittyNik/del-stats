import Express from 'express';
import {
  getAllRecordingsAPI, getVideoLikesRatingAPI, getVideoByCatalystAPI,
  createRecording, updateRecordingsAPI, getVideoLikedByUserAPI,
} from '../../controllers/learning/breakout_recording_details.controller';
import { allowMultipleRoles } from '../../controllers/auth/roles.controller';
import { USER_ROLES } from '../../models/user';

const {
  ADMIN, CATALYST, EDUCATOR, LEARNER,
} = USER_ROLES;

const router = Express.Router();

router.use(allowMultipleRoles([ADMIN, CATALYST, EDUCATOR, LEARNER]));

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
 * @api {get} /learning/content/breakouts/recordings/catalyst/:id
 * Get all Content Breakouts recordings for Catalyst
 * @apiDescription get all Content Breakouts recordings
 * @apiHeader {String} authorization JWT Token.
 * @apiName GetContentBreakouts
 * @apiGroup ContentBreakoutsRecordings
 */
router.get('/liked-by-user', getVideoLikedByUserAPI);

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
router.get('/:id', getVideoLikesRatingAPI);

/**
 * @api {get} /learning/content/breakouts/recordings/catalyst/:id
 * Get all Content Breakouts recordings for Catalyst
 * @apiDescription get all Content Breakouts recordings
 * @apiHeader {String} authorization JWT Token.
 * @apiName GetContentBreakouts
 * @apiGroup ContentBreakoutsRecordings
 */
router.get('/catalyst/:id', getVideoByCatalystAPI);

// Restrict modifications for any applicant to the cohorts
router.use(allowMultipleRoles([ADMIN, CATALYST, EDUCATOR]));

/**
 * @api {post} /learning/content/breakouts/recordings/details Insert Breakout recording
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
 * @api {patch} /learning/content/breakouts/recordings/details/:id Update Breakout recording
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
