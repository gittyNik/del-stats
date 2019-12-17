import Express from 'express';
import { getUpcomingReviews } from '../../controllers/learning/cohort_milestone.controller';
import { apiNotReady } from '../../controllers/api.controller';

const router = Express.Router();

/**
 * @api {get} /learning/ops/reviews Get all Reviews attended by learnes
 * @apiDescription get all Reviews attended by learnes
 * @apiHeader {String} authorization JWT Token.
 * @apiName GetReviews
 * @apiGroup Reviews
 */
router.get('/', apiNotReady);

/**
 * @api {get} /learning/ops/reviews/upcoming Get all upcoming Reviews
 * @apiDescription get all upcoming Reviews
 * @apiHeader {String} authorization JWT Token.
 * @apiName GetReviews
 * @apiGroup Reviews
 */
router.get('/upcoming', getUpcomingReviews);

/**
 * @api {post} /learning/ops/reviews Submit a Review
 * @apiDescription Submit a Review that the learner has attended
 * @apiHeader {String} authorization JWT Token.
 * @apiName AddReview
 * @apiGroup Review
 */
router.post('/', apiNotReady);

export default router;
