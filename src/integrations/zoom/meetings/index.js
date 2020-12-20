import Express from 'express';
import {
  scheduleNewMeeting, meetingDetails,
  listMeetings, attachZoomToBreakout,
} from './meetings.controller';

const router = Express.Router();

// TODO @pranay-sama check if auth is required here

router.post('/create-scheduled', scheduleNewMeeting);
router.post('/attach-meeting', attachZoomToBreakout);
router.get('/:meetingId', meetingDetails);
router.get('/:zoom_user_id/list', listMeetings);

export default router;
