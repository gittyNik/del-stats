import Express from 'express';
import {
  getAllCalendarEvents, createCalendarEvent,
  updateCalendarEvent, createEventForEducator,
  deleteOneEvent, createEventForLearner,
} from '../../../integrations/calendar/controllers/calendar.controller';

const router = Express.Router();

/**
 * @api {get} /calendar Get all Calendar events for a user
 * @apiDescription get all Calendar events
 * @apiHeader {String} authorization JWT Token.
 * @apiName GetCalendarEvents
 * @apiGroup CalendarEvents
 */
router.get('/', getAllCalendarEvents);

/**
 * @api {get} /calendar/:id Get a Calendar event
 * @apiDescription get a Calendar event
 * @apiHeader {String} authorization JWT Token.
 * @apiName GetCalendarEvent
 * @apiGroup CalendarEvent
 */
// router.get('/:id', getEvent);

/**
 * @api {post} /calendar Add Calendar Event
 * @apiDescription Add a Calendar Event
 * @apiHeader {String} authorization JWT Token.
 * @apiName AddCalendarEvent
 * @apiGroup CalendarEvent
 */
router.post('/', createCalendarEvent);

/**
 * @api {post} /calendar/learner Add Calendar Events for Learner
 * @apiDescription Add Calendar Events for Learner
 * @apiHeader {String} authorization JWT Token.
 * @apiName AddCalendarEvent
 * @apiGroup CalendarEvent

 */
// router.post('/learner', scheduleCalendarEventForLearner);

/**
 * @api {patch} /calendar/:id  Update Calendar Event
 * @apiDescription Update a Calendar Event
 * @apiHeader {String} authorization JWT Token.
 * @apiName UpdateCalendarEvent
 * @apiGroup CalendarEvent
 *
 * @apiParam {String} eventId google calendar event Id
 */
router.patch('/:eventId', updateCalendarEvent);

/**
 * @api {delete} /calendar/:id  Delete Calendar Event
 * @apiDescription Delete a Calendar Event
 * @apiHeader {String} authorization JWT Token.
 * @apiName DeleteCalendarEvent
 * @apiGroup CalendarEvent
 */
router.delete('/:eventId', deleteOneEvent);

/**
 * @api {post} /calendar/createEvent  Creates calendar events for a learner
 * @apiDescription creates and updates the caledar event for a learner in learnerBreakout
 * @apiHeader {String} authorization JWT Token.
 * @apiName AddCalendarEventForLearner
 * @apiGroup CalendarEvent
 *
 * @apiParam {String} learner_id  learner_id
 */
router.post('/createEvent', createEventForLearner);

export default router;
