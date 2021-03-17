import Express from 'express';
import {
  scheduleNewMeeting, meetingDetails,
  listMeetings, attachZoomToBreakout,
} from './meetings.controller';
import {
  allowMultipleRoles,
} from '../../../controllers/auth/roles.controller';
import { USER_ROLES } from '../../../models/user';

const {
  ADMIN, CATALYST, EDUCATOR,
  REVIEWER, LEARNER, OPERATIONS,
} = USER_ROLES;

const router = Express.Router();

router.use(allowMultipleRoles([ADMIN, OPERATIONS, EDUCATOR, CATALYST, LEARNER, REVIEWER]));
/**
 * @api {get} /integrations/zoom/meeting/:meetingId Get Meeting Details
 * @apiDescription Get Meeting Details
 * @apiHeader {String} authorization JWT Token.
 * @apiName GetMeeting
 * @apiGroup VideoMeeting
 * 
 */
router.get('/:meetingId', meetingDetails);

router.use(allowMultipleRoles([ADMIN, OPERATIONS, EDUCATOR, CATALYST, REVIEWER]));

/**
 * @api {post} /integrations/zoom/meeting/create-scheduled Create a video meeting
 * @apiDescription Create a video meeting
 * @apiHeader {String} authorization JWT Token.
 * @apiName CreateMeeting
 * @apiGroup VideoMeeting

 * @apiParam {String} topic
 * @apiParam {String} type
 * @apiParam {String} start_time
 * @apiParam {String} duration
 * @apiParam {String} agenda
 * @apiParam {String} catalyst_id
 * @apiParam {String} time_zone
 */
router.post('/create-scheduled', scheduleNewMeeting);

/**
 * @api {post} /integrations/zoom/meeting/attach-meeting Attach meeting to existing breakout
 * @apiDescription Attach meeting
 * @apiHeader {String} authorization JWT Token.
 * @apiName AttachMeeting
 * @apiGroup VideoMeeting

 * @apiParam {String} cohort_breakout_id
 */
router.post('/attach-meeting', attachZoomToBreakout);

/**
 * @api {post} /integrations/zoom/meeting/:zoom_user_id/list List Zoom meetings
 * @apiDescription List Meetings
 * @apiHeader {String} authorization JWT Token.
 * @apiName GetMeeting
 * @apiGroup VideoMeeting

 */
router.get('/:zoom_user_id/list', listMeetings);

// router.use(allowMultipleRoles([ADMIN, CATALYST, EDUCATOR, REVIEWER, OPERATIONS]));

router.post('/create-scheduled', scheduleNewMeeting);
router.post('/attach-meeting', attachZoomToBreakout);

export default router;
