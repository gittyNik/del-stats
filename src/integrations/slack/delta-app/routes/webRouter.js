import Express from 'express';
import { sendMessage, notifyLearnersInChannel } from '../controllers/web.controller';

const router = Express.Router();

router.post('/send-message', sendMessage);
/*
 * @api {post} /integrations/slack/delta/web/notify-learners  Notify learners in slack
 * @apiDescription Notify learner to join the breakout or review or assessment or QH
 * @apiName NotifyLearnersInSlackChannel
 * @apiGroup SlackIntegration
 *
 * @apiParam {String} cohort_id to notify using @channel.
 * @apiParam {String} learner_id Id of the learner.
 * @apiParam {String} text Optinal text for notifying a learner
 * @apiParam {String} type Enum of 'review', 'assessment', 'breakout', 'question_hour'
 * @apiParam {Number} team_number Team number for review
 * */
router.post('/notify-learners', notifyLearnersInChannel);

export default router;
