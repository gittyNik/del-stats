import Express from 'express';
import { hasDiscordSocialConnectionAPI } from '../handlers/user.handler';

const router = Express.Router();

/**
 * @api {post} integrations/discord/delta/channel/createCohortChannel Create a Discord Channel for a Cohort.
 * @apiHeader {String} authorization JWT Token.
 * @apiName createCohortChannel
 * @apiGroup discord
 *
 * @apiParam {String} cohort_id Id of the cohort
 * @apiParam {String[]} emailList email list of all learners yet to join
 */
router.post('/hasDiscord', hasDiscordSocialConnectionAPI);

export default router;
