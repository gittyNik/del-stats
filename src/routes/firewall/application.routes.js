import Express from 'express';
import {
  getAllApplications, getApplicationsByUserId, getApplicationById,
  getLiveApplications, addApplication, updateApplication, deleteApplication,
  payment, getLatestApplication, getApplicationStats, getApplicationStageAPI,
  setApplicationStageAPI, getPaymentAmount, verifyPayment,
  logProcessFailure, setOfferedISA,
  getApplicationByStatus,
} from '../../controllers/firewall/application.controller';
import { apiNotReady } from '../../controllers/api.controller';

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
 * @api {get} /firewall/applications/stage  Get Application STAGE
 * @apiDescription Update an application
 * @apiHeader {String} authorization JWT Token.
 * @apiName UpdateApplication
 * @apiGroup Application
 *
 */

router.get('/stage', getApplicationStageAPI);

/**
 * @api {get} /firewall/applications/latest Get latest application by current user
 * @apiDescription get latest application by current user id along with the test details
 * @apiHeader {String} authorization JWT Token.
 * @apiName getLatestApplication
 * @apiGroup Application
 */
router.get('/latest', getLatestApplication);

/**
 * @api {get} /firewall/applications/user/:id Get Applications by UserId
 * @apiDescription get all applications by user id
 * @apiHeader {String} authorization JWT Token.
 * @apiName GetApplicationsByUserId
 * @apiGroup Application
 */
router.get('/user/:id', getApplicationsByUserId);


/**
 * @api {get} /firewall/applications/status/:status Get Application by status
 * @apiDescription Get application by status
 * @apiHeader {String} authorization JWT Token
 * @apiName ApplicationStatus
 * @apiGroup Application
 *
 * @apiParam {String} status Status to filter applications
 */
router.get('/status/:status', getApplicationByStatus);

/**
 * @api {get} /firewall/applications/:id Get an Application
 * @apiDescription get an Application
 * @apiHeader {String} authorization JWT Token.
 * @apiName GetApplication
 * @apiGroup Application
 */
router.get('/:id', getApplicationById);

/**
 * @api {get} /firewall/applications/:id/stats Get application stats
 * @apiDescription get statistics of an Application
 * @apiHeader {String} authorization JWT Token.
 * @apiName GetApplicationStats
 * @apiGroup Application
 */
router.get('/:id/stats', getApplicationStats);

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
 * @api {patch} /firewall/applications/stage  Update Application STAGE
 * @apiDescription Update an application
 * @apiHeader {String} authorization JWT Token.
 * @apiName UpdateApplication
 * @apiGroup Application
 *
 * @apiParam {String} stage
 */

router.patch('/stage', setApplicationStageAPI);

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
 * @api {patch} /firewall/applications/:id/review Submit review of application
 * @apiDescription Review an application
 * @apiHeader {String} authorization JWT Token.
 * @apiName ReviewApplication
 * @apiGroup Application
 *
 * @apiParam {String} status
 */
router.patch('/:id', apiNotReady);

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

/**
 * @api {get} /firewall/applications/payment-amount Get payment amount
 * @apiDescription Get payment amount for both tranches
 * @apiHeader {String} authorization JWT Token
 * @apiName ApplicatoinPayment
 * @apiGroup Application
 *
 * @apiParam {String} purpose Purpose of Payment
 */
router.get('/payment-amount', getPaymentAmount);

/**
 * @api {get} /firewall/applications/payment/:payment_id/verify Verify Payment
 * @apiDescription Verify payment status based on payment_id
 * @apiHeader {String} authorization JWT Token
 * @apiName ApplicationPayment
 * @apiGroup Application
 *
 * @apiParam {String} payment_id Payment ID
 */
router.post('/payment/:payment_request_id/verify', verifyPayment);

/**
 * @api {post} /firewall/applications/offerISA change offered_ISA status
 * @apiDescription Change offered ISA status for ISA/non-ISA
 * @apiHeader {String} authorization JWT Token.
 * @apiName ApplicationOfferISA
 * @apiGroup Application
 */
router.post('/offerISA', setOfferedISA);

// admin guest operations and educator
/**
 * @api {post} /career/applications/logProcessFailure Log Process
 * @apiDescription Log failure/success events to process_status
 * @apiHeader {String} authorization JWT Token.
 * @apiName ApplicationLogFailure
 * @apiGroup Application
 */
router.post('/logProcessFailure', logProcessFailure);

export default router;
