import Express from 'express';
import {signinWithGithub, linkWithGithub} from '../controllers/oauth.controller';

const router = Express.Router();

/**
 * @api {get} /auth/oauth/github/signin Signin using github account
 * @apiDescription This is the first request made in the sign in process. A token will be sent back to the frontend for authentication with github
 * @apiName SigninWithGithub
 * @apiGroup SocialConnection
 * @apiParam {String} code Authentication code provided by github after login
 */
router.get('/github/signin', signinWithGithub);

/**
 * @api {post} /auth/oauth/github/link Link github account
 * @apiDescription This is used when a logged in user attempts to attach github account
 * @apiName LinkGithub
 * @apiGroup SocialConnection
 * @apiParam {String} code Authentication code provided by github after login
 */
router.post('/github/link', linkWithGithub);

export default router;
