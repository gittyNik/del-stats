import Express from 'express';
import {
  getAllCompanyProfilesAPI, getCompanyProfileFromIdAPI,
  createCompanyProfileAPI, updateCompanyProfileByIdAPI,
  removeCompanyProfileAPI, getCompanyProfileFromRecruiterIdAPI,
} from '../../controllers/career/company_profile.controller';
import { allowMultipleRoles } from '../../controllers/auth/roles.controller';
import { USER_ROLES } from '../../models/user';

// Educator needs to be removed
const {
  ADMIN, LEARNER, RECRUITER, CAREER_SERVICES, EDUCATOR,
} = USER_ROLES;

const router = Express.Router();

router.use(allowMultipleRoles([ADMIN, RECRUITER, CAREER_SERVICES, LEARNER, EDUCATOR]));

/**
 * @api {get} /career/company Get all Career CompanyProfiles
 * @apiDescription get all Career CompanyProfiles
 * @apiHeader {String} authorization JWT Token.
 * @apiName GetCompanyProfiles
 * @apiGroup CompanyProfile
 */
router.get('/', getAllCompanyProfilesAPI);

/**
 * @api {get} /career/company/recruiter/:id Get Company by Recruiter ID
 * @apiDescription get all Career CompanyProfiles by Recruiter ID
 * @apiHeader {String} authorization JWT Token.
 * @apiName GetCompanyProfilesByRecruiterID
 * @apiGroup CompanyProfile
 */
router.get('/recruiter/', getCompanyProfileFromRecruiterIdAPI);

/**
 * @api {get} /career/company/:id Get by Career CompanyProfile id
 * @apiDescription get by id Career CompanyProfile
 * @apiHeader {String} authorization JWT Token.
 * @apiName GetCompanyProfile
 * @apiGroup CompanyProfile
 */
router.get('/:id', getCompanyProfileFromIdAPI);

// Restrict modifications for any applicant to the cohorts
router.use(allowMultipleRoles([ADMIN, CAREER_SERVICES, RECRUITER, EDUCATOR]));

/**
 * @api {post} /career/company/ Add Career CompanyProfile
 * @apiDescription Add an porfolio
 * @apiHeader {String} authorization JWT Token.
 * @apiName AddCompanyProfile
 * @apiGroup CompanyProfile
 *
 * @apiParam {String} name,
 * @apiParam {Text} description,
 * @apiParam {String} logo,
 * @apiParam {String} website,
 * @apiParam {Text} worklife,
 * @apiParam {Text} perks,
 * @apiParam {Array} tags,
 * @apiParam {Array} recruiters,
 */
router.post('/', createCompanyProfileAPI);

/**
 * @api {patch} /career/company/:id  Update Career CompanyProfile
 * @apiDescription Update an porfolio
 * @apiHeader {String} authorization JWT Token.
 * @apiName UpdateCompanyProfile
 * @apiGroup CompanyProfile
 *
 * @apiParam {Uuid} company_id Id of the company
 * @apiParam {Text} description Description of the company
 * @apiParam {String} logo logo of the company
 * @apiParam {String} website website url for the company
 * @apiParam {Text} worklife worklife at the company
 * @apiParam {Text} perks perks at the company
 * @apiParam {Array} tags tags associated with tech stack for company
 * @apiParam {Array} recruiters recruiters for company
 */
router.patch('/:id', updateCompanyProfileByIdAPI);

/**
 * @api {delete} /career/company/:id  Update Career CompanyProfile
 * @apiDescription Delete a company profile
 * @apiHeader {String} authorization JWT Token.
 * @apiName UpdateCompanyProfile
 * @apiGroup CompanyProfile
 *
 * @apiParam {String} id of the company
 */
router.delete('/:id', removeCompanyProfileAPI);

export default router;
