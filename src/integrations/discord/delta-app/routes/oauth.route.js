import Express from 'express';
import { discordBotOAuth2 } from '../client';
import oauth2Route, { oauthBotRedirect } from '../handlers/oauth.handler';
import { joinDiscord } from '../controllers/oauth.controller';

import authenticate from '../../../../controllers/auth/auth.controller';
import { allowSuperAdminOnly } from '../../../../controllers/auth/roles.controller';

const router = Express.Router();

router.get('/redirect', oauth2Route);
router.get('/bot-redirect', oauthBotRedirect);

// Private Routes.
router.use(authenticate);
router.use(allowSuperAdminOnly);

/*
 * @api {post} /integrations/slack/delta/web/notify-learners  Notify learners in slack
 * @apiDescription Notify learner to join the breakout or review or assessment or QH
 * @apiName NotifyLearnersInSlackChannel
 * @apiGroup SlackIntegration
 * @apiHeader {String} authorization JWT Token.
 *
 * @apiParam {String} cohort_id to notify using @channel.
 * @apiParam {String} learner_id Id of the learner.
 * @apiParam {String} text Optinal text for notifying a learner
 * @apiParam {String} type Enum of 'review', 'assessment', 'breakout', 'question_hour'
 * @apiParam {Number} team_number Team number for review
 * */
// router.post('/notify-learners', notifyLearnersInChannel);

// invite bot to server using OAuth2
router.get('/invite-bot', (req, res) => {
  let uri = discordBotOAuth2.code.getUri();
  res.redirect(uri);
});

// invite user to discord,
router.get('/join-discord', joinDiscord);

export default router;
