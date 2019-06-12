import Express from 'express';
import {get_latest,get_top,get_resources,get_milestone_resources,get_topic_resources,get_resource,insert_resource,update_resource,delete_resource,get_comments,insert_comment,delete_comment,upvote,downvote,get_report,insert_report,update_report,unmoderated_requests,approve_resource} from '../controllers/link.controller';

const router = Express.Router();

router.get('/latest',get_latest);
router.get('/top',get_top);
router.get('',get_resources);
router.get('/:resource_id([0-9]*)',get_resource);
router.post('',insert_resource);
router.patch('/:resource_id([0-9]*)',update_resource);
router.delete('/:resource_id([0-9]*)',delete_resource);
router.get('/:resource_id([0-9]*)/comments',get_comments);
router.post('/:resource_id([0-9]*)/comments',insert_comment);
router.delete('/:resource_id([0-9]*)/comments/:comment_id([0-9]*)',delete_comment);
router.post('/:resource_id/vote',upvote);
router.delete('/:resource_id([0-9]*)/vote',downvote);
router.get('/reports',get_report);
router.post('/:resource_id([0-9]*)/reports',insert_report);
router.patch('/:resource_id([0-9]*)/reports/:report_id([0-9]*)/resolve',update_report);
router.get('/pending',unmoderated_requests);
router.patch('/:resource_id([0-9]*)/approve',approve_resource);

export default router;