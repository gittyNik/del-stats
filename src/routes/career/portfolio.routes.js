import Express from 'express';
import {
  getAllPortfolios, createPortfolio,
  updatePortfolio, deletePortfolio,
} from '../../controllers/career/portfolio.controller';

const router = Express.Router();

/**
 * @api {get} /career/portfolios Get all Career Portfolios
 * @apiDescription get all Career Portfolios
 * @apiHeader {String} authorization JWT Token.
 * @apiName GetPortfolios
 * @apiGroup Portfolio
 */
router.get('/', getAllPortfolios);

/**
 * @api {post} /career/portfolios/ Add Career Portfolio
 * @apiDescription Add an porfolio
 * @apiHeader {String} authorization JWT Token.
 * @apiName AddPortfolio
 * @apiGroup Portfolio
 *
 * @apiParam {String} learner_id Id of the learner
 * @apiParam {String[]} showcase_projects List of all projects
 * @apiParam {String[]} fields_of_interest List of all interested fields
 * @apiParam {String[]} city_choices List of all preferred cities
 * @apiParam {String} educational_background Educational Background of Learner
 * @apiParam {String} experience_level Experience level of learner
 * @apiParam {String} relevant_experience_level Relevant experience level
 * @apiParam {Binary} resume Resume of Learner
 * @apiParam {String} review Review of the portfolio
 * @apiParam {String} reviewed_by Reveiwed By
 * @apiParam {String} status Status of portfolio
 * @apiParam {String} hiring_status Hiring status of the learner.
 */
router.post('/', createPortfolio);

/**
 * @api {patch} /career/portfolios/:id  Update Career Portfolio
 * @apiDescription Update an porfolio
 * @apiHeader {String} authorization JWT Token.
 * @apiName UpdatePortfolio
 * @apiGroup Portfolio
 *
 * @apiParam {String} learner_id Id of the learner
 * @apiParam {String[]} showcase_projects List of all projects
 * @apiParam {String[]} fields_of_interest List of all interested fields
 * @apiParam {String[]} city_choices List of all preferred cities
 * @apiParam {String} educational_background Educational Background of Learner
 * @apiParam {String} experience_level Experience level of learner
 * @apiParam {String} relevant_experience_level Relevant experience level
 * @apiParam {Binary} resume Resume of Learner
 * @apiParam {String} review Review of the portfolio
 * @apiParam {String} reviewed_by Reveiwed By
 * @apiParam {String} status Status of portfolio
 * @apiParam {String} hiring_status Hiring status of the learner.
 */
router.patch('/:id', updatePortfolio);

/**
 * @api {delete} /career/portfolios/:id Delete Career Portfolio
 * @apiDescription Delete an porfolio
 * @apiHeader {String} authorization JWT Token.
 * @apiName DeletePortfolio
 * @apiGroup Portfolio
 */
router.delete('/:id', deletePortfolio);

export default router;
