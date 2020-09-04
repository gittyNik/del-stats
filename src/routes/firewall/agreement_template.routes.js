import Express from 'express';
import {
  getTemplateId,
  createAgreementTemplatesAPI,
  updateAgreementTemplatesAPI,
  deleteAgreementTemplateAPI,
} from '../../controllers/firewall/agreement_template.controller';
import {
  allowMultipleRoles,
} from '../../controllers/auth/roles.controller';
import { USER_ROLES } from '../../models/user';

const {
  ADMIN, OPERATIONS,
} = USER_ROLES;

const router = Express.Router();

/**
 * @api {post} /firewall/agreement Get Agreement
 * @apiDescription get agreement id for learner
 * @apiHeader {String} authorization JWT Token.
 * @apiName AgreementTemplate
 * @apiGroup Agreement
 *
 * @apiParam {json} Agreement parameters
    program,
    cohort_duration,
    is_isa boolean,
    is_job_guarantee boolean,
    payment_type Full/Loan
 */
router.get('/', getTemplateId);

// Restrict modifications for any applicant to the cohorts
router.use(allowMultipleRoles([ADMIN, OPERATIONS]));

/**
 * @api {post} /firewall/agreement/ Add Agreement template
 * @apiDescription Add a Agreement
 * @apiHeader {String} authorization JWT Token.
 * @apiName AddAgreement
 * @apiGroup Agreement

 * @apiParam {String} program
 * @apiParam {String} cohort_duration
 * @apiParam {String} is_isa
 * @apiParam {String} is_job_guarantee
 * @apiParam {String} payment_type
 * @apiParam {String} payment_details
 * @apiParam {String} updated_by
 */
router.post('/create', createAgreementTemplatesAPI);

/**
 * @api {patch} /firewall/agreement/:id  Update Agreement template
 * @apiDescription Update a AssessmentSlot
 * @apiHeader {String} authorization JWT Token.
 * @apiName UpdateAssessmentSlot
 * @apiGroup AssessmentSlots
 *
 * @apiParam {String} program
 * @apiParam {String} cohort_duration
 * @apiParam {Boolean} is_isa
 * @apiParam {String} is_job_guarantee
 * @apiParam {String} payment_type
 * @apiParam {String} payment_details
 * @apiParam {String} updated_by
 */
router.patch('/:id', updateAgreementTemplatesAPI);

/**
 * @api {delete} /learning/content/assessment-slots/:id Delete Agreement template
 * @apiDescription Delete a Content AssessmentSlot
 * @apiHeader {String} authorization JWT Token.
 * @apiName DeleteAssessmentSlot
 * @apiGroup AssessmentSlots
 */
router.delete('/:id', deleteAgreementTemplateAPI);

export default router;
