import Express from 'express';
import {
  getApplicantPlansEndpoint,
  addPaymentDetailsEndpoint,
  addPaymentIntervalsEndpoint,
} from '../../controllers/operations/payment.controller';
import { USER_ROLES } from '../../models/user';
import {
  allowMultipleRoles,
} from '../../controllers/auth/roles.controller';

const {
  ADMIN, OPERATIONS, GUEST, LEARNER
} = USER_ROLES;

const router = Express.Router();

router.use(allowMultipleRoles([ADMIN, OPERATIONS, GUEST, LEARNER]));

/**
 * @api {get} /payment/applicant/:id Gets payment details for applicant
 * @apiDescription Get payment details
 * @apiHeader {String} authorization JWT Token.
 * @apiName GetPayment
 * @apiGroup Payment
 */
router.get('/applicant/:id', getApplicantPlansEndpoint);

/**
 * @api {post} /payment/details Add payment details
 * @apiDescription Add payment details
 * @apiHeader {String} authorization JWT Token.
 * @apiName AddPaymentDetails
 * @apiGroup Payment
 */
router.post('/details', addPaymentDetailsEndpoint);

/**
 * @api {post} /payment/intervals Add payment intervals
 * @apiDescription Add payment intervals
 * @apiHeader {String} authorization JWT Token.
 * @apiName AddPaymentIntervals
 * @apiGroup Payment
 */
router.post('/intervals', addPaymentIntervalsEndpoint);

export default router;
