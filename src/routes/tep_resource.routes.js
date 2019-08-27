import Express from 'express';
import {
  getLatest, getTop, getAll, getUnmoderated, getOne, create, update,
  deleteOne, getComments, addComment, deleteComment, upvote, unvote,
  getReports, addReport, resolveReport, approve, getTrending,
} from '../controllers/tep_resource.controller';

const router = Express.Router();

/**
 * @api {get} /tep/resources/reports Get all TEP resource reports
 * @apiHeader {String} authorization JWT Token.
 * @apiName GetAllReports
 * @apiGroup TEP Resource Report
 */
router.get('/reports', getReports);

/**
 * @api {post} /tep/resources/:resource_id/reports Report TEP resource
 * @apiHeader {String} authorization JWT Token.
 * @apiName AddReport
 * @apiGroup TEP Resource Report
 *
 * @apiParam {String} report report of the resource
 */
router.post('/:resource_id/reports', addReport);

/**
 * @api {patch} /tep/resources/:resource_id/reports/:report_id/resolve Update resource report
 * status.
 * @apiHeader {String} authorization JWT Token.
 * @apiName ResolveReport
 * @apiGroup TEP Resource Report
 */
router.patch('/:resource_id/reports/:report_id/resolve', resolveReport);

/**
 * @api {get} /tep/resources Get all TEP resources
 * @apiHeader {String} authorization JWT Token.
 * @apiName GetAll
 * @apiGroup TEP Resource
 */
router.get('/', getAll);

/**
 * @api {get} /tep/resources/latest Get latest TEP resources
 * @apiHeader {String} authorization JWT Token.
 * @apiName GetLatest
 * @apiGroup TEP Resource
 */
router.get('/latest', getLatest);

/**
 * @api {get} /tep/resources/top Get the top TEP resources
 * @apiHeader {String} authorization JWT Token.
 * @apiName GetTop
 * @apiGroup TEP Resource
 */
router.get('/top', getTop);

/**
 * @api {get} /tep/resources/trending Get the trending TEP resources
 * @apiHeader {String} authorization JWT Token.
 * @apiName GetTrending
 * @apiGroup TEP Resource
 */
router.get('/trending', getTrending);

/**
 * @api {get} /tep/resources/pending Get Unmoderated TEP resources
 * @apiHeader {String} authorization JWT Token.
 * @apiName GetUnmoderated
 * @apiGroup TEP Resource
 */
router.get('/pending', getUnmoderated);

/**
 * @api {post} /tep/resources Add new TEP resources
 * @apiHeader {String} authorization JWT Token.
 * @apiName Create
 * @apiGroup TEP Resource
 *
 * @apiParam {String} url URL of the resource
 * @apiParam {String} topic_id Topic the resource belongs to
 * @apiParam {String} type article/repo/video/tweet
 * @apiParam {String} level beginner/advanced
 */
router.post('/', create);

/**
 * @api {get} /tep/resources/:resource_id Get one TEP resource
 * @apiHeader {String} authorization JWT Token.
 * @apiName GetOne
 * @apiGroup TEP Resource
 */
router.get('/:resource_id', getOne);

/**
 * @api {patch} /tep/resources/:resource_id Update TEP resource
 * @apiHeader {String} authorization JWT Token.
 * @apiName Update
 * @apiGroup TEP Resource
 *
 * @apiParam {String} url URL of the resource
 */
router.patch('/:resource_id', update);

/**
 * @api {delete} /tep/resources/:resource_id Delete TEP resource
 * @apiHeader {String} authorization JWT Token.
 * @apiName DeleteOne
 * @apiGroup TEP Resource
 */
router.delete('/:resource_id', deleteOne);

/**
 * @api {patch} /tep/resources/:resource_id/approve Update TEP resource status
 * @apiHeader {String} authorization JWT Token.
 * @apiName Approve
 * @apiGroup TEP Resource
 */
router.patch('/:resource_id/approve', approve);

/**
 * @api {get} /tep/resources/:resource_id/comments Get TEP resource comments
 * @apiHeader {String} authorization JWT Token.
 * @apiName GetComments
 * @apiGroup TEP Resource Comment
 */
router.get('/:resource_id/comments', getComments);

/**
 * @api {post} /tep/resources/:resource_id/comments Add TEP resource comments
 * @apiHeader {String} authorization JWT Token.
 * @apiName AddComment
 * @apiGroup TEP Resource Comment
 *
 * @apiParam {String} comment comment about the resource
 */
router.post('/:resource_id/comments', addComment);

/**
 * @api {delete} /tep/resources/:resource_id/comments/:comment_id Delete TEP resource comment
 * @apiHeader {String} authorization JWT Token.
 * @apiName DeleteComment
 * @apiGroup TEP Resource Comment
 */
router.delete('/:resource_id/comments/:comment_id', deleteComment);

/**
 * @api {post} /tep/resources/:resource_id/vote Vote TEP resource
 * @apiHeader {String} authorization JWT Token.
 * @apiName Upvote
 * @apiGroup TEP Resource Vote
 */
router.post('/:resource_id/vote', upvote);

/**
 * @api {delete} /tep/resources/:resource_id/vote Unvote TEP resource
 * @apiHeader {String} authorization JWT Token.
 * @apiName Unvote
 * @apiGroup TEP Resource Vote
 *
 * @apiParam {String} user_id id of the user
 */
router.delete('/:resource_id/vote', unvote);


export default router;
