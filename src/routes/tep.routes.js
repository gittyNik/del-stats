import Express from 'express';
import resource from './tep_resource.routes';
import topic from './tep_topic.routes';
import milestone from './tep_milestone.routes';

const router = Express.Router();

router.get('/resources', resource);
router.get('/topics', topic);
router.get('/milestones', milestone);

export default router;
