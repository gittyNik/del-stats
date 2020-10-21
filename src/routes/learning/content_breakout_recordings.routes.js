import Express from 'express';
import {
  getRecordingsByCatalystAPI,
  createRecording, updateRecordingsAPI, getVideoUrl,
} from '../../controllers/learning/breakout_recording.controller';
import { allowMultipleRoles } from '../../controllers/auth/roles.controller';
import { USER_ROLES } from '../../models/user';
import LearnerBreakout from '../../models/learner_breakout';

const {
  ADMIN, CATALYST, EDUCATOR, LEARNER, REVIEWER,
} = USER_ROLES;

const router = Express.Router();

router.use(allowMultipleRoles([ADMIN, CATALYST, EDUCATOR, LEARNER, REVIEWER]));

/**
 * @api {get} /learning/content/breakouts/recordings/:id/video Get Video of recording
 * @apiDescription get Video recordings
 * @apiHeader {String} authorization JWT Token.
 * @apiName GetContentBreakouts
 * @apiGroup ContentBreakoutsRecordings
 */
router.get('/:id/video', getVideoUrl);

// Restrict modifications for any applicant to the cohorts
router.use(allowMultipleRoles([ADMIN, CATALYST, EDUCATOR, REVIEWER]));

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
