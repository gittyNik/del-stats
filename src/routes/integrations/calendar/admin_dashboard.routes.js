import express from 'express';
import {
  getAllEvents, createEventForBreakout,
} from '../../../integrations/calendar/controllers/calendar-admin.controller';

const router = express.Router();

router.get('/events/', getAllEvents);

router.post('/events/', createEventForBreakout);

export default router;
