import Express from 'express';
import {
  getAllApplications, getApplication, createApplication,
  updateApplication, deleteApplication,
} from '../../controllers/career/job_application.controller';
import { apiNotReady } from '../../controllers/api.controller';

const router = Express.Router();

/**
 * @api {get} /career/applications Get all Applications
 * @apiDescription get all Applications
 * @apiHeader {String} authorization JWT Token.
 * @apiName GetApplications
 * @apiGroup JobApplication
 */
router.get('/', getAllApplications);

/**
 * @api {get} /career/applications/live Get live Applications
 * @apiDescription get live Applications
 * @apiHeader {String} authorization JWT Token.
 * @apiName GetLiveApplications
 * @apiGroup JobApplication
 */
router.get('/live', apiNotReady);

/**
 * @api {get} /career/applications/latest Get latest applications
 * @apiDescription get latest application by current user id along with the test details
 * @apiHeader {String} authorization JWT Token.
 * @apiName getLatestApplication
 * @apiGroup JobApplication
 */
router.get('/latest', apiNotReady);

/**
 * @api {get} /career/applications/user/:id Get Applications by UserId
 * @apiDescription get all applications by user id
 * @apiHeader {String} authorization JWT Token.
 * @apiName GetApplicationsByUserId
 * @apiGroup JobApplication
 */
router.get('/user/:id', apiNotReady);

/**
 * @api {get} /career/applications/:id Get an Application
 * @apiDescription get an Application
 * @apiHeader {String} authorization JWT Token.
 * @apiName GetApplication
 * @apiGroup JobApplication
 */
router.get('/:id', getApplication);

/**
 * @api {post} /career/applications/ Add Application
 * @apiDescription Add an application
 * @apiHeader {String} authorization JWT Token.
 * @apiName AddApplication
 * @apiGroup JobApplication
 */
router.post('/', createApplication);

/**
 * @api {patch} /career/applications/:id  Update Application
 * @apiDescription Update an application
 * @apiHeader {String} authorization JWT Token.
 * @apiName UpdateApplication
 * @apiGroup JobApplication
 */
router.patch('/:id', updateApplication);

/**
 * @api {patch} /career/applications/:id/review Submit review of application
 * @apiDescription Review an application
 * @apiHeader {String} authorization JWT Token.
 * @apiName ReviewApplication
 * @apiGroup JobApplication
 */
router.patch('/:id', apiNotReady);

/**
 * @api {delete} /career/applications/:id Delete Application
 * @apiDescription Delete an application
 * @apiHeader {String} authorization JWT Token.
 * @apiName DeleteApplication
 * @apiGroup JobApplication
 */
router.delete('/:id', deleteApplication);

export default router;
