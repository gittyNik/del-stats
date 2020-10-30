import Express from 'express';
import {
  getAllJobPostingsAPI, getJobPostingsByStatusAPI,
  getJobPostingById, getJobPostingsByCompanyAPI,
  createJobPostingAPI, updateJobPostingAPI,
  removeJobPostingAPI,

} from '../../controllers/career/job_posting.controller';
import { allowMultipleRoles } from '../../controllers/auth/roles.controller';
import { USER_ROLES } from '../../models/user';

const {
  ADMIN, LEARNER, RECRUITER, CAREER_SERVICES,
} = USER_ROLES;

const router = Express.Router();

router.use(allowMultipleRoles([ADMIN, RECRUITER, CAREER_SERVICES, LEARNER]));

/**
 * @api {get} /career/jobs Get all Career JobPostings
 * @apiDescription get all Career JobPostings
 * @apiHeader {String} authorization JWT Token.
 * @apiName GetJobPostings
 * @apiGroup JobPosting
 */
router.get('/', getAllJobPostingsAPI);

/**
 * @api {get} /career/jobs/status Get all Career JobPostings by status
 * @apiDescription get all Career JobPostings
 * @apiHeader {String} authorization JWT Token.
 * @apiName GetJobPostings
 * @apiGroup JobPosting
 */
router.get('/status', getJobPostingsByStatusAPI);

/**
 * @api {get} /career/jobs/:id Get by Career JobPosting id
 * @apiDescription get by id Career JobPosting
 * @apiHeader {String} authorization JWT Token.
 * @apiName GetJobPosting
 * @apiGroup JobPosting
 */
router.get('/:id', getJobPostingById);

/**
 * @api {get} /career/jobs/company/:id Get by Career JobPosting learner id
 * @apiDescription get by learner id Career JobPosting
 * @apiHeader {String} authorization JWT Token.
 * @apiName GetJobPosting
 * @apiGroup JobPosting
 */
router.get('/company/:id', getJobPostingsByCompanyAPI);

// Restrict modifications for any applicant to the cohorts
router.use(allowMultipleRoles([ADMIN, CAREER_SERVICES, RECRUITER]));

/**
 * @api {post} /career/jobs/ Add Career JobPosting
 * @apiDescription Add an porfolio
 * @apiHeader {String} authorization JWT Token.
 * @apiName AddJobPosting
 * @apiGroup JobPosting
 *
 * @apiParam {String} company_id Id of the Company
 * @apiParam {Text} description
 * @apiParam {Array} tags List of tags
 * @apiParam {String} status Status of Job Posting, default - active
 */
router.post('/', createJobPostingAPI);

/**
 * @api {patch} /career/jobs/:id  Update Career JobPosting
 * @apiDescription Update an porfolio
 * @apiHeader {String} authorization JWT Token.
 * @apiName UpdateJobPosting
 * @apiGroup JobPosting
 *
 * @apiParam {Uuid} company_id Id of the company
 * @apiParam {Text} description Description of the job
 * @apiParam {String[]} fields_of_interest List of all interested fields
 */
router.patch('/:id', updateJobPostingAPI);

/**
 * @api {patch} /career/jobs/:id  Update Career JobPosting
 * @apiDescription Update an porfolio
 * @apiHeader {String} authorization JWT Token.
 * @apiName UpdateJobPosting
 * @apiGroup JobPosting
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
router.patch('/learner/:id', updateJobPostingLearnerAPI);

export default router;
