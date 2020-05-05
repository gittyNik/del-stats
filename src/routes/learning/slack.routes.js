import Express from 'express';
import { createChannelForCohort } from '../../controllers/learning/slack.controller';
import { allowSuperAdminOnly } from '../../controllers/auth/roles.controller';

const router = Express.Router();


// Restrict modifications for any applicant to the cohorts
router.use(allowSuperAdminOnly);

/**
 * @api {post} /slack Create a Slack Channel for a Cohort.
 * @apiHeader {String} authorization JWT Token.
 * @apiName createCohortChannel
 * @apiGroup slack
 *
 * @apiParam {String} cohort_id Id of the cohort
 * @apiParam {String[]} emailList email list of all learners yet to join
 */
router.post('/createCohortChannel', createChannelForCohort);

export default router;
