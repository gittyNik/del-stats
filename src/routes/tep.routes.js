import Express from 'express';
import resource from './tep_resource.routes';
import topic from './tep_topic.routes';
import milestone from './tep_milestone.routes';

const router = Express.Router();

router.use('/topics', topic);
router.use('/resources', resource);
router.use('/milestones', milestone);
router.use('/challenges', topic);

export default router;
