import Express from 'express';
import { createProgramRoleAPI } from '../handlers/role.handler';

const router = Express.Router();

/**
 * @api {post} integrations/discord/delta/role/program Create a Discord Channel for a Cohort.
 * @apiHeader {String} authorization JWT Token.
 * @apiName createCohortChannel
 * @apiGroup discord
 *
 * @apiParam {String} cohort_id Id of the cohort
 * @apiParam {String[]} emailList email list of all learners yet to join
 */
router.post('/program', createProgramRoleAPI);

export default router;
