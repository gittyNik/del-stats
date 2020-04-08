import Express from 'express';
import {
  getDocumentsByID, getDocumentsByUserId,
  getDocumentsStatus, updateUser, createUser,
  getDocumentsAll,
} from '../../controllers/firewall/documents.controller';
import { allowSuperAdminOnly } from '../../controllers/auth/roles.controller';
// import { apiNotReady } from '../../controllers/api.controller';

const router = Express.Router();

// Restrict modifications for any applicant to the cohorts
router.use(allowSuperAdminOnly);

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
