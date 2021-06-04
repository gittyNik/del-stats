import Express from 'express';
import { allowSuperAdminOnly } from '../../../controllers/auth/roles.controller';
import { createChannelForCohortAPI } from '../../../integrations/discord/delta-app/handlers/channel.handler';

const router = Express.Router();

// Restrict modifications for any applicant to the cohorts
router.use(allowSuperAdminOnly);

/**
 * @api {post} integrations/discord/delta/channel/createCohortChannel Create a Discord Channel for a Cohort.
 * @apiHeader {String} authorization JWT Token.
 * @apiName createCohortChannel
 * @apiGroup discord
 *
 * @apiParam {String} cohort_id Id of the cohort
 * @apiParam {String[]} emailList email list of all learners yet to join
 */
router.post('/createCohortChannel', createChannelForCohortAPI);

export default router;
