import Express from 'express';
import {get_resources,get_resource,update_resource,delete_resource,get_comments,insert_comment,delete_comment,upvote,downvote,get_report,insert_report,update_report,unmoderated_requests,approve_resource} from '../controllers/link.controller';

const router = Express.Router();

router.get('/resources',get_resources);
router.get('/resources/:resource_id',get_resource);
router.patch('/resources/:resource_id',update_resource);
router.delete('/resources/:resource_id',delete_resource);
router.get('/resources/:resource_id/comments',get_comments);
router.post('/resources/:resource_id/comments',insert_comment);
router.delete('/resources/:resource_id/comments/:comment_id',delete_comment);
router.post('/resources/:resource_id/vote',upvote);
router.delete('/resources/:resource_id/vote',downvote);
router.get('/resources/reports',get_report);
router.post('/resources/:resource_id/reports',insert_report);
router.patch('/resources/:resource_id/reports/:report_id/resolve',update_report);
router.get('/resources/pending',unmoderated_requests);
router.patch('/resources/:resource_id/approve',approve_resource);

export default router;