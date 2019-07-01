import Express from 'express';
import {sendOTP, retryOTP, verifyOTP} from '../controllers/otp.controller';

const router = Express.Router();

/**
 * @api {post} /auth/otp/send Send OTP to the user
 * @apiName SendOTP
 * @apiGroup Authentication
 * @apiExample Example usage:
 *  endpoint : http://localhost:3000/auth/otp/send
 *  body:
 *  {
 *    "phone": "919323134595"
 *  }
 * @apiParam (Request Body) {String} phone Enter Phone Number With Prefix
 */
router.post('/send', sendOTP);

/**
 * @api {post} /auth/otp/retry Retry sending OTP to the user
 * @apiName RetryOTP
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
router.post('/retry', retryOTP);

/**
 * @api {verify} /auth/otp/verify Verify the OTP
 * @apiDescription Verifies that the sent OTP is correct and authenticates a user
 * @apiGroup Authentication
 * @apiExample Example usage:
 *  endpoint : http://localhost:3000/auth/otp/send
 *  body:
 *  {
 *    "phone": "919323134595"
 *  }
 * @apiParam (Request Body) {String} phone Enter Phone Number With Prefix
 */
router.get('/verify', verifyOTP);

export default router;
