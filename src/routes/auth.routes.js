import Express from 'express';
import jwt from 'jsonwebtoken';
import {accessControl, authenticate, signinWithGithub, send, verify, retry} from '../controllers/auth.controller';
import AUTH_SCOPES from '../util/authScopes';

const router = Express.Router();

router.use(accessControl);
/**
 * @api {get} /auth Check Authenticity Of Request
 * @apiName Authenticate
 * @apiGroup Authentication
 * @apiHeader authorization JWT Token
 */

// This route doesn't need to be authenticated
router.use('/oauth/github/signin', signinWithGithub);

router.post('/otp/send', send)
/**
 * @api {post} /auth/otp/send Send Otp to phone
 * @apiName SendOtp
 * @apiGroup Authentication
 * @apiExample Example usage:
 *  endpoint : http://localhost:3000/auth/otp/send
 *  body:
 *  {
 *    "phone": "919323134595"
 *  }
 * @apiParam (Request Body) {String} phone Enter Phone Number With Prefix
 */

router.post('/otp/verify', verify)
/**
 * @api {post} /auth/otp/verify Verify User Authentication Using OTP
 * @apiName VerifyOtp
 * @apiDescription Creates a new Applicant/Coummunity Member or Logs in the User
 * @apiGroup Authentication
 * @apiExample Example usage:
 *  endpoint : http://localhost:3000/auth/otp/verify
 *  body:
 *  {
 *    "phone": "countryCode"+"Phone Number",
 *    "otp": "3952",
 *    "apply": true
 *  }
 * @apiParam (Request Body) {String} phone Enter Phone Number With 
 * @apiParam (Request Body) {String} otp OTP string
 * @apiParam (Request Body) {Boolean} [apply] Applicant?
 */

 router.post('/otp/retry', retry)
/**
 * @api {post} /auth/otp/retry Retry Sending OTP
 * @apiName RetryOtp
 * @apiGroup Authentication
 * @apiExample Example usage:
 *  endpoint : http://localhost:3000/auth/otp/retry
 *  body:
 *  {
 *    "phone": "countryCode"+"Phone Number",
 *    "retryVoice": "true"
 *  }
 * @apiParam (Request Body) {String} phone Enter Phone Number With 
 * @apiParam (Request Body) {Boolean} retryVoice Boolean to Enable Voice
 */
router.use(authenticate);

// Restrict students in these routes
router.use('/cohorts', (req, res, next) => {
  if(req.jwtData.scope === AUTH_SCOPES.STUDENT){
    // res.sendStatus(403);
  }
  next();
});

export default router;
