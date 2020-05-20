import Express from 'express';
import {
  getLatest,
  getTop,
  getAll,
  getUnmoderated,
  getOne,
  create,
  update,
  deleteOne,
  getComments,
  addComment,
  deleteComment,
  upvote,
  unvote,
  getReports,
  addReport,
  resolveReport,
  approve,
  getTrending,
  getFirewall,
  logResourceVisit,
  getTaggedResources,
  getResourceUrl,
  searchTaggedResources,
  getTopicResource,
} from '../../controllers/learning/content_resource.controller';

import { allowSuperAdminOnly } from '../../controllers/auth/roles.controller';

const router = Express.Router();

/**
 * @api {get} /learning/content/resources/reports Get all Content resource reports
 * @apiHeader {String} authorization JWT Token.
 * @apiName GetAllReports
 * @apiGroup Content Resource Report
 */
router.get('/reports', getReports);

/**
 * @api {post} /learning/content/resources/:resource_id/reports Report Content resource
 * @apiHeader {String} authorization JWT Token.
 * @apiName AddReport
 * @apiGroup Content Resource Report
 *
 * @apiParam {String} report report of the resource
 */
router.post('/:resource_id/reports', addReport);
/**
 * @api {post} /learning/content/resources/:resource_id/visits Log Content resource visit
 * @apiHeader {String} authorization JWT Token.
 * @apiName LogResourceVisit
 * @apiGroup Content Resource
 */
router.post('/:resource_id/visits', logResourceVisit);

/**
 * @api {patch} /learning/content/resources/:resource_id/reports/:report_id/resolve
 *  Update resource report status.
 * @apiHeader {String} authorization JWT Token.
 * @apiName ResolveReport
 * @apiGroup Content Resource Report
 */
router.patch(
  '/:resource_id/reports/:report_id/resolve',
  allowSuperAdminOnly,
  resolveReport,
);

/**
 * @api {get} /learning/content/resources Get all Content resources
 * @apiHeader {String} authorization JWT Token.
 * @apiName GetAll
 * @apiGroup Content Resource
 */
router.get('/', allowSuperAdminOnly, getAll);

/**
 * @api {get} /learning/content/resources/tag/:tag Get tagged resources
 * @apiHeader {String} authorization JWT Token.
 * @apiName GetTaggedResource
 * @apiGroup Content Resource
 */
router.get('/tag/:tag', getTaggedResources);

/**
 * @api {get} /learning/content/resources/search Search resources
 * @apiHeader {String} authorization JWT Token.
 * @apiName SearchResources
 * @apiGroup Content Resource Comment
 *
 * @apiParam {String} comment comment about the resource
 */
router.get('/search', searchTaggedResources);

/**
 * @api {get} /learning/content/resources/topic Get resources by topic id
 * @apiHeader {String} authorization JWT Token.
 * @apiName GetTopicResource
 * @apiGroup Content Resource Comment
 *
 * @apiParam {String} get all resources by topic id
 */
router.get('/topic/:topic_id', getTopicResource);

/**
 * @api {get} /learning/content/resources/latest Get latest Content resources
 * @apiHeader {String} authorization JWT Token.
 * @apiName GetLatest
 * @apiGroup Content Resource
 */
router.get('/latest', getLatest);

/**
 * @api {get} /learning/content/resources/top Get the top Content resources
 * @apiHeader {String} authorization JWT Token.
 * @apiName GetTop
 * @apiGroup Content Resource
 */
router.get('/top', getTop);

/**
 * @api {get} /learning/content/resources/trending Get the trending Content resources
 * @apiHeader {String} authorization JWT Token.
 * @apiName GetTrending
 * @apiGroup Content Resource
 */
router.get('/trending', getTrending);

/**
 * @api {get} /learning/content/resources/firewall Get the resources for firewall
 * @apiHeader {String} authorization JWT Token.
 * @apiName GetFirewallResources
 * @apiGroup Content Resource
 */
router.get('/firewall', getFirewall);

/**
 * @api {get} /learning/content/resources/pending Get Unmoderated Content resources
 * @apiHeader {String} authorization JWT Token.
 * @apiName GetUnmoderated
 * @apiGroup Content Resource
 */
router.get('/pending', allowSuperAdminOnly, getUnmoderated);

/**
 * @api {post} /learning/content/resources/url/:url Get resources by url
 * @apiHeader {String} authorization JWT Token.
 * @apiName GetResourceUrl
 * @apiGroup Content Resource
 */
router.post('/url', getResourceUrl);

/**
 * @api {post} /learning/content/resources Add new Content resources
 * @apiHeader {String} authorization JWT Token.
 * @apiName Create
 * @apiGroup Content Resource
 *
 * @apiParam {String} url URL of the resource
 * @apiParam {String} topic_id Topic the resource belongs to
 * @apiParam {String} type article/repo/video/tweet
 * @apiParam {String} level beginner/advanced
 */
router.post('/', create);

/**
 * @api {get} /learning/content/resources/:resource_id Get one Content resource
 * @apiHeader {String} authorization JWT Token.
 * @apiName GetOne
 * @apiGroup Content Resource
 */
router.get('/:resource_id', getOne);

/**
 * @api {patch} /learning/content/resources/:resource_id Update Content resource
 * @apiHeader {String} authorization JWT Token.
 * @apiName Update
 * @apiGroup Content Resource
 *
 * @apiParam {String} url URL of the resource
 */
router.patch('/:resource_id', allowSuperAdminOnly, update);

/**
 * @api {delete} /learning/content/resources/:resource_id Delete Content resource
 * @apiHeader {String} authorization JWT Token.
 * @apiName DeleteOne
 * @apiGroup Content Resource
 */
router.delete('/:resource_id', allowSuperAdminOnly, deleteOne);

/**
 * @api {patch} /learning/content/resources/:resource_id/approve Update Content resource status
 * @apiHeader {String} authorization JWT Token.
 * @apiName Approve
 * @apiGroup Content Resource
 */
router.patch('/:resource_id/approve', allowSuperAdminOnly, approve);

/**
 * @api {get} /learning/content/resources/:resource_id/comments Get Content resource comments
 * @apiHeader {String} authorization JWT Token.
 * @apiName GetComments
 * @apiGroup Content Resource Comment
 */
router.get('/:resource_id/comments', getComments);

/**
 * @api {post} /learning/content/resources/:resource_id/comments Add Content resource comments
 * @apiHeader {String} authorization JWT Token.
 * @apiName AddComment
 * @apiGroup Content Resource Comment
 *
 * @apiParam {String} comment comment about the resource
 */
router.post('/:resource_id/comments', addComment);

/**
 * @api {delete} /learning/content/resources/:resource_id/comments/:comment_id
 * Delete Content resource comment
 * @apiHeader {String} authorization JWT Token.
 * @apiName DeleteComment
 * @apiGroup Content Resource Comment
 */
router.delete('/:resource_id/comments/:comment_id', deleteComment);

/**
 * @api {post} /learning/content/resources/:resource_id/vote Vote Content resource
 * @apiHeader {String} authorization JWT Token.
 * @apiName Upvote
 * @apiGroup Content Resource Vote
 */
router.post('/:resource_id/vote', upvote);

/**
 * @api {delete} /learning/content/resources/:resource_id/vote Unvote Content resource
 * @apiHeader {String} authorization JWT Token.
 * @apiName Unvote
 * @apiGroup Content Resource Vote
 *
 * @apiParam {String} user_id id of the user
 */
router.delete('/:resource_id/vote', unvote);

export default router;
