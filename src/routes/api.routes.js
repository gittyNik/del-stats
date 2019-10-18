import Express from 'express';

// Delta modules
import careerRouter from './career';
import communityRouter from './community';
import firewallRouter from './firewall';
import learningRouter from './learning';

import authRouter from './auth';
import adminRouter from './admin.routes';

import authenticate from '../controllers/auth/auth.controller';
import { browserAccessControl, devOnly, send404, sendSampleResponse } from '../controllers/api.controller';
import { getProfile } from '../controllers/community/user.controller';

const router = Express.Router();

// All routes
router.use(browserAccessControl);

// Public routes
router.use('/auth', authRouter);
router.use('/doc', devOnly, Express.static('./doc'));

// Partially private routes
router.use('/firewall', firewallRouter);

// Fully private routes
router.use(authenticate);
router.use('/career', careerRouter);
router.use('/community', communityRouter);
router.use('/learning', learningRouter);
router.use('/admin', adminRouter);
/**
 * @api {get} /profile Get profile
 * @apiDescription Get the profile information of the currently loggedin user
 * @apiHeader {String} authorization JWT Token.
 * @apiName GetProfile
 * @apiGroup Profile
 */
router.use('/profile', getProfile);

/**
 * @api {get} / Get sample response
 * @apiDescription Get a sample response for logged in users
 * @apiHeader {String} authorization JWT Token.
 * @apiName GetSampleResponse
 * @apiGroup Profile
 */
router.get('/', sendSampleResponse);
router.use('*', send404);

export default router;
