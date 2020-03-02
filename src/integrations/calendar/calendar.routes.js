import Express from 'express';
import { getAllCalendarEvents, createCalendarEvent } from './calendar.controller';

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
//router.get('/:id', getEvent);

/**
 * @api {post} /calendar Add Calendar Event
 * @apiDescription Add a Calendar Event
 * @apiHeader {String} authorization JWT Token.
 * @apiName AddCalendarEvent
 * @apiGroup CalendarEvent

 * @apiParam {String} title Title of the topic
 * @apiParam {String} description Description of the topic
 * @apiParam {String} milestone_id ID of the Milestone
 */
router.post('/', createCalendarEvent);

/**
 * @api {patch} /calendar/:id  Update Calendar Event
 * @apiDescription Update a Calendar Event
 * @apiHeader {String} authorization JWT Token.
 * @apiName UpdateCalendarEvent
 * @apiGroup CalendarEvent
 *
 * @apiParam {String} title title of the topic
 * @apiParam {String} description Description of the topic
 * @apiParam {String} milestone_id UUID of the Milestone
 */
//router.patch('/:id', updateTopic);

/**
 * @api {delete} /calendar/:id  Delete Calendar Event
 * @apiDescription Delete a Calendar Event
 * @apiHeader {String} authorization JWT Token.
 * @apiName DeleteCalendarEvent
 * @apiGroup CalendarEvent
 */
//router.delete('/:id', deleteOne);

export default router;