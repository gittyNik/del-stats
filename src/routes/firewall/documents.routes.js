import Express from 'express';
import {
  getDocumentsByID, getDocumentsByUserId,
  getDocumentsStatus, updateUser, createUser,
  getDocumentsAll, EsignRequest, getSignUrl,
  insertUserDocument, downloadEsignDocument,
  saveEnachMandate,
  createDebitRequestNach, createMandate,
} from '../../controllers/firewall/documents.controller';
import { allowMultipleRoles } from '../../controllers/auth/roles.controller';
import { USER_ROLES } from '../../models/user';

const {
  ADMIN, EDUCATOR, LEARNER, OPERATIONS, REVIEWER, CATALYST, CAREER_SERVICES,
  GUEST,
} = USER_ROLES;
// import { apiNotReady } from '../../controllers/api.controller';

const router = Express.Router();

router.use(allowMultipleRoles([ADMIN, LEARNER,
  OPERATIONS, EDUCATOR, REVIEWER, CATALYST, CAREER_SERVICES, GUEST]));

/**
 * @api {get} /firewall/documents/sign-request/ Upload files to AWS
 * @apiDescription upload Document by status
 * @apiHeader {String} authorization JWT Token.
 * @apiName GetUserDocumentResources
 * @apiGroup Documents
 */
router.post('/sign-request', getSignUrl);

/**
 * @api {get} /firewall/documents/save-mandate/ Save mandate details
 * @apiDescription save mandate details
 * @apiHeader {String} authorization JWT Token.
 * @apiName SaveMandateDetails
 * @apiGroup Documents
 */
router.post('/save-mandate', saveEnachMandate);

/**
 * @api {patch} /firewall/documents/:id/esign Send Esign Request to User
 * @apiDescription Send Esign Request to a User
 * @apiHeader {String} authorization JWT Token.
 * @apiName SendESignRequest
 * @apiGroup Documents
 *
 * @apiParam {String} id user id
 * @apiParam {Json} template_values
 * @apiParam {String} template_id Template to send
 * @apiParam {Json} sign_coordinates co-ordinates where sign is required
 * @apiParam {String} expire_in_days for document expiry
 * @apiParam {Boolean} notify_signers notify via email
 * @apiParam {Boolean} send_sign_link send link
 * @apiParam {String} file_name file name to save doc as
 * @apiParam {Json} signers signer details
 */
router.post('/:id/esign', EsignRequest);

router.use(allowMultipleRoles([ADMIN, LEARNER, OPERATIONS, EDUCATOR, REVIEWER]));

/**
 * @api {get} /firewall/documents/save/ save document
 * @apiDescription upload Document
 * @apiHeader {String} authorization JWT Token.
 * @apiName GetUserDocumentResources
 * @apiGroup Documents
 */
router.post('/save', insertUserDocument);

/**
 * @api {get} /firewall/documents Get all Documents
 * @apiDescription get all Documents
 * @apiHeader {String} authorization JWT Token.
 * @apiName GetDocuments
 * @apiGroup Documents
 */
router.get('/', getDocumentsAll);

/**
 * @api {get} /firewall/documents/:id Get document for User
 * @apiDescription get a document for User
 * @apiHeader {String} authorization JWT Token.
 * @apiName GetDocuments
 * @apiGroup Documents
 */
router.get('/:id', getDocumentsByUserId);

/**
 * @api {get} /firewall/documents/esign/:id/download Download document for user
 * @apiDescription Download Esign document for User
 * @apiHeader {String} authorization JWT Token.
 * @apiName DownloadDocuments
 * @apiGroup Documents
 */
router.get('/esign/:id/download', downloadEsignDocument);

/**
 * @api {get} /firewall/documents/docid/:id/ Get document by doc id
 * @apiDescription get document by doc id
 * @apiHeader {String} authorization JWT Token.
 * @apiName GetDocuments
 * @apiGroup Documents
 */
router.get('/docid/:id', getDocumentsByID);

/**
 * @api {get} /firewall/documents/status/:id/ Get Document by status
 * @apiDescription get Document by status
 * @apiHeader {String} authorization JWT Token.
 * @apiName GetUserDocumentResources
 * @apiGroup Documents
 */
router.get('/status/:id', getDocumentsStatus);

// Restrict modifications for any applicant to the cohorts
router.use(allowMultipleRoles([ADMIN, OPERATIONS, EDUCATOR]));

/**
 * @api {get} /firewall/documents/create-debit/ Credit Debit request
 * @apiDescription create debit request
 * @apiHeader {String} authorization JWT Token.
 * @apiName CreateDebitRequest
 * @apiGroup Documents
 */
router.post('/create-debit', createDebitRequestNach);

/**
 * @api {get} /firewall/documents/create-mandate/ Credit Mandate request
 * @apiDescription create mandate request
 * @apiHeader {String} authorization JWT Token.
 * @apiName CreateDebitRequest
 * @apiGroup Documents
 */
router.post('/create-mandate', createMandate);

/**
 * @api {post} /firewall/documents/ Add Users Documents
 * @apiDescription Add a Users Documents
 * @apiHeader {String} authorization JWT Token.
 * @apiName AddUserDocument
 * @apiGroup Documents

 * @apiParam {String} user_id
 * @apiParam {String} document_details Description of the topic
 * @apiParam {String} status ID of the Milestone
 * @apiParam {String} payment_status Description of the topic
 * @apiParam {String} is_isa Description of the topic
 * @apiParam {String} is_verified Description of the topic
 */
router.post('/', createUser);

/**
 * @api {patch} /firewall/documents/:id  Update User Documents
 * @apiDescription Update a User Documents
 * @apiHeader {String} authorization JWT Token.
 * @apiName UpdateUserDocument
 * @apiGroup Documents
 *
 * @apiParam {String} user_id
 * @apiParam {String} document_details Description of the topic
 * @apiParam {String} status ID of the Milestone
 * @apiParam {String} payment_status Description of the topic
 * @apiParam {String} is_isa Description of the topic
 * @apiParam {String} is_verified Description of the topic
 */
router.patch('/:id', updateUser);

/**
 * @api {delete} /learning/content/topics/:id Delete Content Topic
 * @apiDescription Delete a Content Topic
 * @apiHeader {String} authorization JWT Token.
 * @apiName DeleteUserDocument
 * @apiGroup Documents
 */
// router.delete('/:id', deleteOne);

export default router;
