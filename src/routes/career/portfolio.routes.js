import Express from 'express';
import { apiNotReady } from '../../controllers/api.controller';

const router = Express.Router();

/**
 * @api {get} /career/portfolios Get all Career Portfolios
 * @apiDescription get all Career Portfolios
 * @apiHeader {String} authorization JWT Token.
 * @apiName GetPortfolios
 * @apiGroup Portfolio
 */
router.get('/', apiNotReady);

/**
 * @api {post} /career/portfolios/ Add Career Portfolio
 * @apiDescription Add an counsellor
 * @apiHeader {String} authorization JWT Token.
 * @apiName AddPortfolio
 * @apiGroup Portfolio
 */
router.post('/', apiNotReady);

/**
 * @api {patch} /career/portfolios/:id  Update Career Portfolio
 * @apiDescription Update an counsellor
 * @apiHeader {String} authorization JWT Token.
 * @apiName UpdatePortfolio
 * @apiGroup Portfolio
 */
router.patch('/:id', apiNotReady);

/**
 * @api {delete} /career/portfolios/:id Delete Career Portfolio
 * @apiDescription Delete an counsellor
 * @apiHeader {String} authorization JWT Token.
 * @apiName DeletePortfolio
 * @apiGroup Portfolio
 */
router.delete('/:id', apiNotReady);

export default router;
