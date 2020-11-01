import Express from 'express';
import { sendOTP, retryOTP, verifyOTP, registerRecruiterAPI } from '../../controllers/auth/otp.controller';
import authenticate from '../../controllers/auth/auth.controller';
import { allowSuperAdminOnly } from '../../controllers/auth/roles.controller';

const router = Express.Router();

/**
 * @api {post} /auth/otp/send Send OTP to the user
 * @apiName SendOTP
 * @apiGroup Authentication
 * @apiParam {String} phone Enter Phone Number With Prefix
 */
router.post('/send', sendOTP);

/**
 * @api {post} /auth/otp/retry Retry sending OTP to the user
 * @apiName RetryOTP
 * @apiGroup Authentication
 * @apiParam {String} phone Enter Phone Number
 * @apiParam {Boolean} retryVoice Boolean to Enable Voice
 */
router.post('/retry', retryOTP);

/**
 * @api {get} /auth/otp/verify Verify the OTP
 * @apiName VerifyOTP
 * @apiDescription Verifies that the sent OTP is correct and authenticates a user
 * @apiGroup Authentication
 * @apiParam {String} phone Enter Phone Number With Prefix
 * @apiParam {Number{0000-9999}} otp Enter OTP
 */
router.get('/verify', verifyOTP);

router.use(authenticate);

// TEMP route to register recruiters bypassing OTP.
router.get('/register-recruiter', allowSuperAdminOnly, registerRecruiterAPI);

export default router;
