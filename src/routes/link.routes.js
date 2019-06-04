import Express from 'express';
import {unmoderated_requests,approve_resource, insert_report,retrieve_report,update_report} from '../controllers/link.controller';

const router = Express.Router();

router.get('/resources/reports',retrieve_report);
router.post('/resources/:resource_id/reports',insert_report);
router.patch('/resources/:resource_id/reports/:report_id/resolve',update_report);
router.get('/resources/pending',unmoderated_requests);
router.patch('/resources/:resource_id/approve',approve_resource);

export default router;