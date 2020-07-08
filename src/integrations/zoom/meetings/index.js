import Express from 'express';
import {
  scheduleNewMeeting, meetingDetails,
  listMeetings, attachZoomToBreakout,
} from './meetings.controller';

const router = Express.Router();

router.post('/create-scheduled', scheduleNewMeeting);
router.post('/attach-meeting', attachZoomToBreakout);
router.get('/:meetingId', meetingDetails);
router.get('/:zoom_user_id/list', listMeetings);

export default router;
