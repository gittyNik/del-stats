import express from 'express';
import {
  updateStatusEndpoint,
  updateRemarksEndpoint,
  updateInterviewDateEndpoint,
} from '../controllers';

const router = express.Router();

/**
 * @api {patch} /status Update status and/or remarks for a certain interview
 * @apiDescription Update interview details
 * @apiHeader {String} authorization JWT Token.
 * @apiName updateInterview
 * @apiGroup Interview Events
 */
router.patch('/status', updateStatusEndpoint);

/**
 * @api {patch} /status Update remarks for a certain interview
 * @apiDescription Update interview details
 * @apiHeader {String} authorization JWT Token.
 * @apiName updateInterview
 * @apiGroup Interview Events
 */
router.patch('/remark', updateRemarksEndpoint);

/**
 * @api {patch} /status Update interview date for a certain interview
 * @apiDescription Update interview details
 * @apiHeader {String} authorization JWT Token.
 * @apiName updateInterview
 * @apiGroup Interview Events
 */
router.patch('/date', updateInterviewDateEndpoint);

export default router;
