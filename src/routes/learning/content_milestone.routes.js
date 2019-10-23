import Express from 'express';
import { apiNotReady } from '../../controllers/api.controller';

const router = Express.Router();

/**
 * @api {get} /learning/content/milestones Get all Content Milestones
 * @apiDescription get all Content Milestones
 * @apiHeader {String} authorization JWT Token.
 * @apiName GetContentMilestones
 * @apiGroup ContentMilestones
 */
router.get('/', apiNotReady);

/**
 * @api {post} /learning/content/milestones/ Add Content Milestone
 * @apiDescription Add a Content Milestone
 * @apiHeader {String} authorization JWT Token.
 * @apiName AddContentMilestone
 * @apiGroup ContentMilestone
 */
router.post('/', apiNotReady);

/**
 * @api {patch} /learning/content/milestones/:id  Update Content Milestone
 * @apiDescription Update a Content Milestone
 * @apiHeader {String} authorization JWT Token.
 * @apiName UpdateContentMilestone
 * @apiGroup ContentMilestone
 */
router.patch('/:id', apiNotReady);

/**
 * @api {delete} /learning/content/milestones/:id Delete Content Milestone
 * @apiDescription Delete a Content Milestone
 * @apiHeader {String} authorization JWT Token.
 * @apiName DeleteContentMilestone
 * @apiGroup ContentMilestone
 */
router.delete('/:id', apiNotReady);

export default router;
