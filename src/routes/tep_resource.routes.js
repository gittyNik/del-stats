import Express from 'express';

import { getLatest, getTop, getAll, getUnmoderated, getOne, create, update,
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
 * @api {post} /tep/resources/:resource_id/reports Post new TEP resources
 * @apiHeader {String} authorization JWT Token.
 * @apiName AddReport
 * @apiGroup TepResources
 */
router.post('/:resource_id/reports', addReport);

/**
 * @api {patch} /tep/resources/:resource_id/reports/:report_id/resolve Update TEP resources
 * @apiHeader {String} authorization JWT Token.
 * @apiName ResolveReport
 * @apiGroup TepResources
 */
router.patch('/:resource_id/reports/:report_id/resolve', resolveReport);

/**
 * @api {get} /tep/resources/latest Get latest TEP resources
 * @apiHeader {String} authorization JWT Token.
 * @apiName GetLatest
 * @apiGroup TepResources
 */
router.get('/', getAll);
router.get('/latest', getLatest);
router.get('/top', getTop);
router.get('/pending', getUnmoderated);

router.post('/', create);
router.get('/:resource_id', getOne);
router.patch('/:resource_id', update);
router.delete('/:resource_id', deleteOne);
router.patch('/:resource_id/approve', approve);

router.get('/:resource_id/comments', getComments);
router.post('/:resource_id/comments', addComment);
router.delete('/:resource_id/comments/:comment_id', deleteComment);

router.post('/:resource_id/vote', upvote);
router.delete('/:resource_id/vote', unvote);


export default router;
