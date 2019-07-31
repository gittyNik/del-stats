import Express from 'express';
import { getAllApplications, getApplicationsyUserId, getApplicationById,
  getLiveApplications, addApplication, updateApplication, deleteApplication,
  payment } from '../controllers/application.controller';

const router = Express.Router();
/**
 * @api {get} /firewall/applications Get all Applications
 * @apiDescription get all Applications
 * @apiHeader {String} authorization JWT Token.
 * @apiName GetApplications
 * @apiGroup Application
 */
router.get('/', getAllApplications);

/**
 * @api {get} /firewall/applications/live Get live Applications
 * @apiDescription get live Applications
 * @apiHeader {String} authorization JWT Token.
 * @apiName GetLiveApplications
 * @apiGroup Application
 */
router.get('/live', getLiveApplications);

/**
 * @api {get} /firewall/applications/user/:id Get Applications by UserId
 * @apiDescription get all applications by user id
 * @apiHeader {String} authorization JWT Token.
 * @apiName GetApplicationsByUserId
 * @apiGroup Application
 */
router.get('/user/:id', getApplicationsByUserId);

/**
 * @api {get} /firewall/applications/:id Get an Application
 * @apiDescription get an Application
 * @apiHeader {String} authorization JWT Token.
 * @apiName GetApplication
 * @apiGroup Application
 */
router.get('/:id', getApplicationById);

/**
 * @api {post} /firewall/applications/ Add Application
 * @apiDescription Add an application
 * @apiHeader {String} authorization JWT Token.
 * @apiName AddApplication
 * @apiGroup Application
 * 
 * @apiParam {String} cohort_applied
 */
router.post('/', addApplication);

/**
 * @api {patch} /firewall/applications/:id  Update Application
 * @apiDescription Update an application
 * @apiHeader {String} authorization JWT Token.
 * @apiName UpdateApplication
 * @apiGroup Application
 *
 * @apiParam {String} cohort_joining
 * @apiParam {String} status
 */
router.patch('/:id', updateApplication);

/**
 * @api {delete} /firewall/applications/:id Delete Application
 * @apiDescription Delete an application
 * @apiHeader {String} authorization JWT Token.
 * @apiName DeleteApplication
 * @apiGroup Application
 */
router.delete('/:id', deleteApplication);

/**
 * @api {patch} /firewall/applications/:id/payment Add Payment
 * @apiDescription Add payment details of an application
 * @apiHeader {String} authorization JWT Token.
 * @apiName ApplicationPayment
 * @apiGroup Application
 *
 * @apiParam {json} payment_details Payment details
 */
router.patch('/:id/payment', payment);

export default router;
