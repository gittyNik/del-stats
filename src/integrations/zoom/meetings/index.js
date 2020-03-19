import Express from 'express';
import { scheduleNewMeeting, meetingDetails, listMeetings } from './meetings.controller';

const router = Express.Router();

router.post('/create-scheduled', scheduleNewMeeting);
router.get('/:meetingId', meetingDetails);
router.get('/:zoom_user_id/list', listMeetings);

export default router;
