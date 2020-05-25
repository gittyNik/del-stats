import Express from 'express';
import {
  signinWithGithub, linkWithGithub,
  checkGoogleOrSendRedirectUrl, handleGoogleCallback,
} from '../../controllers/auth/oauth.controller';
import authenticate from '../../controllers/auth/auth.controller';

const router = Express.Router();

/**
 * @api {get} /auth/oauth/github/signin Signin using github account
 * @apiDescription This is the first request made in the sign in process.
 * A token will be sent back to the frontend for authentication with github
 * @apiName SigninWithGithub
 * @apiGroup SocialConnection
 * @apiParam {String} code Authentication code provided by github after login
 */
router.get('/github/signin', signinWithGithub);

/**
 * @api {post} /auth/oauth/github/link Link github account
 * @apiHeader {String} authorization JWT Token
 * @apiName LinkGithub
 * @apiDescription This is used when a signed-in user attempts to attach github account
 * @apiGroup SocialConnection
 * @apiParam {String} code Authentication code provided by github after login
 */
router.post('/github/link', authenticate, linkWithGithub);

/**
 * @api {get} /auth/oauth/google-calendar/signin Signin using google calendar account
 * @apiDescription This is the first request made in the sign in process.
 * A token will be sent back to the frontend for authentication with github
 * @apiName SigninWithGoogleCalendar
 * @apiGroup SocialConnection
 * @apiParam {String} code Authentication code provided by github after login
 */
router.get('/google-calendar/signin', handleGoogleCallback);

/**
 * @api {get} /auth/oauth/google/redirect-url get google redirect-url to SignIn
 * @apiHeader {String} authorization JWT Token
 * @apiName GetGoogleRedirectUrl
 * @apiDescription Returns a google-redirect-url to signin if no google social connection is found.
 * @apiGroup SocialConnection
 */
router.get('/google/redirect-url', authenticate, checkGoogleOrSendRedirectUrl);

export default router;
