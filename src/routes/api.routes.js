import Express from 'express';

// Delta modules
import careerRouter from './career';
import communityRouter from './community';
import firewallRouter from './firewall';
import learningRouter from './learning';
import toolsetRouter from './toolset';
import emailer from './emailer';

import authRouter from './auth';
import adminRouter from './admin.routes';
import profileRouter from './community/profile.routes';

import calendarRouter from '../integrations/calendar/calendar.routes'

import authenticate from '../controllers/auth/auth.controller';
import { allowSuperAdminOnly } from '../controllers/auth/roles.controller';
import {
  browserAccessControl,
  devOnly,
  send404,
  sendSampleResponse,
  getSwagger,
} from '../controllers/api.controller';

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
router.use('/toolset', toolsetRouter);
router.use('/admin', adminRouter);
router.use('/profile', profileRouter);
router.use('/email', emailer);

// Calendar
router.use('/calendar', calendarRouter);

/**
 * @api {get} / Get sample response
 * @apiDescription Get a sample response for logged in users
 * @apiHeader {String} authorization JWT Token.
 * @apiName GetSampleResponse
 * @apiGroup Profile
 */
router.get('/', sendSampleResponse);

/**
 * @api {get} /swagger.json Get swagger json
 * @apiDescription Get swgger json
 * @apiHeader {String} authorization JWT Token.
 * @apiName GetSwaggerJson
 * @apiGroup API
 */
router.get('/swagger.json', allowSuperAdminOnly, getSwagger);
router.use('*', send404);

export default router;
