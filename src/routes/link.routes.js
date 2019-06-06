import Express from 'express';
import {get_latest,get_top,get_resources,get_milestone_resources,get_topic_resources,get_resource,insert_resource,update_resource,delete_resource,get_comments,insert_comment,delete_comment,upvote,downvote,get_report,insert_report,update_report,unmoderated_requests,approve_resource} from '../controllers/link.controller';

const router = Express.Router();

router.get('/resources/latest',get_latest);
router.get('/resources/top',get_top);
router.get('/topics/:topic_id/resources',get_topic_resources);
router.get('/milestones/:milestone_id/resources',get_milestone_resources);
router.get('/resources',get_resources);
router.get('/resources/:resource_id([0-9]*)',get_resource);
router.post('/resources',insert_resource);
router.patch('/resources/:resource_id([0-9]*)',update_resource);
router.delete('/resources/:resource_id([0-9]*)',delete_resource);
router.get('/resources/:resource_id([0-9]*)/comments',get_comments);
router.post('/resources/:resource_id([0-9]*)/comments',insert_comment);
router.delete('/resources/:resource_id([0-9]*)/comments/:comment_id([0-9]*)',delete_comment);
router.post('/resources/:resource_id/vote',upvote);
router.delete('/resources/:resource_id([0-9]*)/vote',downvote);
router.get('/resources/reports',get_report);
router.post('/resources/:resource_id([0-9]*)/reports',insert_report);
router.patch('/resources/:resource_id([0-9]*)/reports/:report_id([0-9]*)/resolve',update_report);
router.get('/resources/pending',unmoderated_requests);
router.patch('/resources/:resource_id([0-9]*)/approve',approve_resource);

export default router;