import Express from 'express';
import {
  getAllJobApplicationsAPI, getJobApplicationsByCompanyAPI,
  getJobApplicationsForLearnerIdAPI, getJobApplicationAPI,
  createJobApplicationAPI, updateJobApplicationAPI, deleteJobApplicationAPI,
  sendAssignmentAndCreateApplication,
} from '../../controllers/career/job_application.controller';
import { apiNotReady } from '../../controllers/api.controller';
import { allowMultipleRoles } from '../../controllers/auth/roles.controller';
import { USER_ROLES } from '../../models/user';

const {
  ADMIN, LEARNER, RECRUITER, CAREER_SERVICES,
} = USER_ROLES;

const router = Express.Router();

router.use(allowMultipleRoles([ADMIN, RECRUITER, CAREER_SERVICES, LEARNER]));

/**
 * @api {get} /career/applications Get all Applications
 * @apiDescription get all Applications
 * @apiHeader {String} authorization JWT Token.
 * @apiName GetApplications
 * @apiGroup JobApplication
 */
router.get('/', getAllJobApplicationsAPI);

/**
 * @api {get} /career/applications/company/:id Get Applications for a company
 * @apiDescription get Applications for a company
 * @apiHeader {String} authorization JWT Token.
 * @apiName GetApplicationsForCompany
 * @apiGroup JobApplication
 */
router.get('/company/:id', getJobApplicationsByCompanyAPI);

/**
 * @api {get} /career/applications/live Get Job Applications For Learner
 * @apiDescription get Job Applications for a learner
 * @apiHeader {String} authorization JWT Token.
 * @apiName GetJobApplicationsForLearnerId
 * @apiGroup JobApplication
 */
router.get('/learner/:id', getJobApplicationsForLearnerIdAPI);

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
router.get('/user/:user_id', apiNotReady);

/**
 * @api {get} /career/applications/:id Get an Application
 * @apiDescription get an Application
 * @apiHeader {String} authorization JWT Token.
 * @apiName GetApplication
 * @apiGroup JobApplication
 */
router.get('/:id', getJobApplicationAPI);

router.use(allowMultipleRoles([ADMIN, RECRUITER, CAREER_SERVICES, LEARNER]));

/**
 * @api {post} /career/applications/ Add Application
 * @apiDescription Add an application
 * @apiHeader {String} authorization JWT Token.
 * @apiName AddApplication
 * @apiGroup JobApplication
 */
router.post('/', createJobApplicationAPI);

/**
 * @api {post} /career/applications/assignment Add Assignment and Application
 * @apiDescription Add an assignment/application
 * @apiHeader {String} authorization JWT Token.
 * @apiName AddApplication
 * @apiGroup JobApplication
 */
router.post('/assignment', sendAssignmentAndCreateApplication);

/**
 * @api {patch} /career/applications/:id  Update Application
 * @apiDescription Update an application
 * @apiHeader {String} authorization JWT Token.
 * @apiName UpdateApplication
 * @apiGroup JobApplication
 */
router.patch('/:id', updateJobApplicationAPI);

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
router.delete('/:id', deleteJobApplicationAPI);

export default router;
