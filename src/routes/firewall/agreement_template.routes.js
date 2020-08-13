import Express from 'express';
import getTemplateId from '../../controllers/firewall/agreement_template.controller';

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
router.post('/', getTemplateId);
