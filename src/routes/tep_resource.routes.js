import Express from 'express';

import { getLatest, getTop, getAll,getUnmoderated, getOne, create, update,
  deleteOne, getComments, addComment, deleteComment, upvote, unvote, getReports,
addReport, resolveReport, approve } from '../controllers/tep_resource.controller';

const router = Express.Router();

/**
 * @api {get} /tep/resources/reports Get all TEP resource reports
 * @apiHeader {String} authorization JWT Token.
 * @apiName GetAllReports
 * @apiGroup TepResources
 */
router.get('/reports', getReports);

/**
 * @api {post} /tep/resources/:resource_id/reports Report TEP resource
 * @apiHeader {String} authorization JWT Token.
 * @apiName AddReport
 * @apiGroup TepResources
 *
 * @apiParam {String} report report of the resource
 */
router.post('/:resource_id/reports', addReport);

/**
 * @api {patch} /tep/resources/:resource_id/reports/:report_id/resolve Update TEP resource report status.
 * @apiHeader {String} authorization JWT Token.
 * @apiName ResolveReport
 * @apiGroup TepResources
 */
router.patch('/:resource_id/reports/:report_id/resolve', resolveReport);

/**
 * @api {get} /tep/resources Get all TEP resources
 * @apiHeader {String} authorization JWT Token.
 * @apiName GetAll
 * @apiGroup TepResources
 */
router.get('/', getAll);

/**
 * @api {get} /tep/resources/latest Get latest TEP resources
 * @apiHeader {String} authorization JWT Token.
 * @apiName GetLatest
 * @apiGroup TepResources
 */
router.get('/latest', getLatest);

/**
 * @api {get} /tep/resources/top Get the top TEP resources
 * @apiHeader {String} authorization JWT Token.
 * @apiName GetTop
 * @apiGroup TepResources
 */
router.get('/top', getTop);

/**
 * @api {get} /tep/resources/pending Get Unmoderated TEP resources
 * @apiHeader {String} authorization JWT Token.
 * @apiName GetUnmoderated
 * @apiGroup TepResources
 */
router.get('/pending', getUnmoderated);

/**
 * @api {post} /tep/resources Add new TEP resources
 * @apiHeader {String} authorization JWT Token.
 * @apiName Create
 * @apiGroup TepResources
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
 * @apiGroup TepResources
 */
router.get('/:resource_id', getOne);

/**
 * @api {patch} /tep/resources/:resource_id Update TEP resource
 * @apiHeader {String} authorization JWT Token.
 * @apiName Update
 * @apiGroup TepResources
 *
 * @apiParam {String} url URL of the resource
 */
router.patch('/:resource_id', update);

/**
 * @api {delete} /tep/resources/:resource_id Delete TEP resource
 * @apiHeader {String} authorization JWT Token.
 * @apiName DeleteOne
 * @apiGroup TepResources
 */
router.delete('/:resource_id', deleteOne);

/**
 * @api {patch} /tep/resources/:resource_id/approve Update TEP resource status
 * @apiHeader {String} authorization JWT Token.
 * @apiName Approve
 * @apiGroup TepResources
 */
router.patch('/:resource_id/approve', approve);

/**
 * @api {get} /tep/resources/:resource_id/comments Get TEP resource comments
 * @apiHeader {String} authorization JWT Token.
 * @apiName GetComments
 * @apiGroup TepResources
 */
router.get('/:resource_id/comments', getComments);

/**
 * @api {post} /tep/resources/:resource_id/comments Add TEP resource comments
 * @apiHeader {String} authorization JWT Token.
 * @apiName AddComment
 * @apiGroup TepResources
 *
 * @apiParam {String} comment comment about the resource
 */
router.post('/:resource_id/comments', addComment);

/**
 * @api {delete} /tep/resources/:resource_id/comments/:comment_id Delete TEP resource comment
 * @apiHeader {String} authorization JWT Token.
 * @apiName DeleteComment
 * @apiGroup TepResources
 */
router.delete('/:resource_id/comments/:comment_id', deleteComment);

/**
 * @api {post} /tep/resources/:resource_id/vote Vote TEP resource
 * @apiHeader {String} authorization JWT Token.
 * @apiName Upvote
 * @apiGroup TepResources
 */
router.post('/:resource_id/vote', upvote);

/**
 * @api {delete} /tep/resources/:resource_id/vote Unvote TEP resource
 * @apiHeader {String} authorization JWT Token.
 * @apiName Unvote
 * @apiGroup TepResources
 *
 * @apiParam {String} url URL of the resource
 */
router.delete('/:resource_id/vote', unvote);


export default router;
