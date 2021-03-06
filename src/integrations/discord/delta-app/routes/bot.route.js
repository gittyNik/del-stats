import Express from 'express';
import authenticate from '../../../../controllers/auth/auth.controller';
import { notifyLearnersInChannel } from '../controllers/bot.controller';
import { sendMessageAPI } from '../handlers/bot.handler';

const router = Express.Router();

// Private Routes.

router.use(authenticate);

router.post('/send-message', sendMessageAPI);

/*
 * @api {post} /integrations/discord/delta/bot/notify-learners  Notify learners in discord
 * @apiDescription Notify learner to join the breakout or review or assessment or QH
 * @apiName NotifyLearnersIndiscordChannel
 * @apiGroup discordIntegration
 * @apiHeader {String} authorization JWT Token.
 *
 * @apiParam {String} cohort_id to notify using @channel.
 * @apiParam {String} learner_id Id of the learner.
 * @apiParam {String} text Optinal text for notifying a learner
 * @apiParam {String} type Enum of 'review', 'assessment', 'breakout', 'question_hour'
 * @apiParam {Number} team_number Team number for review
 * */
router.post('/notify-learners', notifyLearnersInChannel);

export default router;
