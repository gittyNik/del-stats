import Express from 'express';
import {
  getAllPortfoliosAPI, getPortfolioById, getPortfolioByUser,
  createPortfolioAPI, getPortfoliosByStatusAPI, updatePortfolio,
  updatePortfolioLearnerAPI, addResumeForLearner, getLearnerListAPI,

} from '../../controllers/career/portfolio.controller';
import { allowMultipleRoles } from '../../controllers/auth/roles.controller';
import { USER_ROLES } from '../../models/user';

const {
  ADMIN, LEARNER, RECRUITER, CAREER_SERVICES,
} = USER_ROLES;

const router = Express.Router();

router.use(allowMultipleRoles([ADMIN, RECRUITER, CAREER_SERVICES, LEARNER]));

/**
 * @api {get} /career/portfolios Get all Career Portfolios
 * @apiDescription get all Career Portfolios
 * @apiHeader {String} authorization JWT Token.
 * @apiName GetPortfolios
 * @apiGroup Portfolio
 */
router.get('/', getAllPortfoliosAPI);

/**
 * @api {get} /career/portfolios Get all Career Portfolios
 * @apiDescription get all learners ready for career assistance
 * @apiHeader {String} authorization JWT Token.
 * @apiName GetLearnerList
 * @apiGroup Portfolio
 */
router.get('/learners', getLearnerListAPI);

/**
 * @api {get} /career/portfolios/status Get all Career Portfolios by status
 * @apiDescription get all Career Portfolios
 * @apiHeader {String} authorization JWT Token.
 * @apiName GetPortfolios
 * @apiGroup Portfolio
 */
router.get('/status', getPortfoliosByStatusAPI);

/**
 * @api {get} /career/portfolios/:id Get by Career Portfolio id
 * @apiDescription get by id Career Portfolio
 * @apiHeader {String} authorization JWT Token.
 * @apiName GetPortfolio
 * @apiGroup Portfolio
 */
router.get('/:id', getPortfolioById);

/**
 * @api {get} /career/portfolios/learner/:id Get by Career Portfolio learner id
 * @apiDescription get by learner id Career Portfolio
 * @apiHeader {String} authorization JWT Token.
 * @apiName GetPortfolio
 * @apiGroup Portfolio
 */
router.get('/learner/:id', getPortfolioByUser);

// Restrict modifications for any applicant to the cohorts
router.use(allowMultipleRoles([ADMIN, CAREER_SERVICES, LEARNER]));

/**
 * @api {post} /career/portfolios/learner/:id/resume Add resume for learner
 * @apiDescription add resume for Learner Career Portfolio
 * @apiHeader {String} authorization JWT Token.
 * @apiName AddResumePortfolio
 * @apiGroup Portfolio
 */
router.post('/learner/:id', addResumeForLearner);

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
router.post('/', createPortfolioAPI);

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
router.patch('/learner/:id', updatePortfolioLearnerAPI);

export default router;
