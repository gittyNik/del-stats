import Express from 'express';
import breakoutRouter from './content_breakout.routes';
import milestoneRouter from './content_milestone.routes';
import resourceRouter from './content_resource.routes';
import topicRouter from './content_topic.routes';

const router = Express.Router();

router.use('/breakouts', breakoutRouter);
router.use('/milestones', milestoneRouter);
router.use('/resources', resourceRouter);
router.use('/topics', topicRouter);

export default router;
