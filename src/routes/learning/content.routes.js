import Express from 'express';
import breakoutRouter from './content_breakout.routes';
import challengeRouter from './content_challenge.routes';
import milestoneRouter from './content_milestone.routes';
import resourceRouter from './content_resource.routes';
import topicRouter from './content_topic.routes';
import { allowSuperAdminOnly } from '../../controllers/auth/roles.controller';

const router = Express.Router();

router.use('/resources', resourceRouter);

// Disable until tested
// router.use(allowSuperAdminOnly);

router.use('/breakouts', breakoutRouter);
router.use('/challenges', challengeRouter);
router.use('/milestones', milestoneRouter);
router.use('/topics', topicRouter);

export default router;
