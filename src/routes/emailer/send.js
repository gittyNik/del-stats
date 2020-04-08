import Express from 'express';
import { sendEmailApi, sendCohortEmailApi } from '../../controllers/emailer/emailer.controller';

const router = Express.Router();

/**
 * @api {post} /email/send
 * @apiDescription This is the first request made in the sign in process.
 * A token will be sent back to the frontend for authentication with github
 * @apiName SendEmail
 * @apiGroup SendEmail
 * @apiParam {String} code Authentication code provided by github after login
 */
router.post('/', sendEmailApi);

/**
 * @api {post} /email/send/cohorts
 * @apiDescription This is the first request made in the sign in process.
 * A token will be sent back to the frontend for authentication with github
 * @apiName SendCohortEmail
 * @apiGroup SendEmail
 * @apiParam {String} code Authentication code provided by github after login
 */
router.post('/cohorts', sendCohortEmailApi);

export default router;
