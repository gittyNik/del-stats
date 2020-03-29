import Express from 'express';
import { sendEmailApi } from '../../../integrations/emailer/emailer.controller';

const router = Express.Router();

/**
 * @api {post} /email
 * @apiDescription This is the first request made in the sign in process.
 * A token will be sent back to the frontend for authentication with github
 * @apiName SigninWithGithub
 * @apiGroup SocialConnection
 * @apiParam {String} code Authentication code provided by github after login
 */
router.post('/', sendEmailApi);

export default router;
