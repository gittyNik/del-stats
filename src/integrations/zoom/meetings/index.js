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

// router.use(allowMultipleRoles([ADMIN, CATALYST, EDUCATOR, REVIEWER, LEARNER, OPERATIONS]));

router.get('/:meetingId', meetingDetails);
router.get('/:zoom_user_id/list', listMeetings);

// router.use(allowMultipleRoles([ADMIN, CATALYST, EDUCATOR, REVIEWER, OPERATIONS]));

router.post('/create-scheduled', scheduleNewMeeting);
router.post('/attach-meeting', attachZoomToBreakout);

export default router;
