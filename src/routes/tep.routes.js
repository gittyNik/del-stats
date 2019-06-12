import Express from 'express';
import resource from './tep_resource.routes';
import topic from './tep_topic.routes';
import milestone from './tep_milestone.routes';

const router = Express.Router();

router.use('/resources', resource);
router.use('/topics', topic);
router.use('/milestones', milestone);

export default router;
