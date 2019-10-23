import Express from 'express';
import { apiNotReady } from '../../controllers/api.controller';

const router = Express.Router();

/**
 * @api {get} /learning/ops/assessments Get all Assessments attended by learnes
 * @apiDescription get all Assessments attended by learnes
 * @apiHeader {String} authorization JWT Token.
 * @apiName GetAssessments
 * @apiGroup Assessments
 */
router.get('/', apiNotReady);

/**
 * @api {get} /learning/ops/assessments/upcoming Get all upcoming Assessments
 * @apiDescription get all upcoming Assessments
 * @apiHeader {String} authorization JWT Token.
 * @apiName GetAssessments
 * @apiGroup Assessments
 */
router.get('/upcoming', apiNotReady);

/**
 * @api {post} /learning/ops/assessments Submit a Assessment
 * @apiDescription Submit a Assessment that the learner has attended
 * @apiHeader {String} authorization JWT Token.
 * @apiName AddAssessment
 * @apiGroup Assessment
 */
router.post('/', apiNotReady);

export default router;
