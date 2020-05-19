import Express from 'express';
import breakoutRouter from './content_breakouts.routes';
import challengeRouter from './content_challenge.routes';
import milestoneRouter from './content_milestone.routes';
import resourceRouter from './content_resource.routes';
import topicRouter from './content_topic.routes';
import reviewsRouter from './content_reviews.routes';
import rubricsRouter from './content_rubrics.routes';
import reviewsSlotsRouter from './content_review_slots.routes';
// import { allowSuperAdminOnly } from '../../controllers/auth/roles.controller';

const router = Express.Router();

router.use('/resources', resourceRouter);

// Disable until tested
// router.use(allowSuperAdminOnly);

router.use('/breakouts', breakoutRouter);
router.use('/challenges', challengeRouter);
router.use('/milestones', milestoneRouter);
router.use('/topics', topicRouter);
router.use('/reviews', reviewsRouter);
router.use('/review-slots', reviewsSlotsRouter);
router.use('/rubrics', rubricsRouter);

export default router;
