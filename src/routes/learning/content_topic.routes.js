import Express from 'express';
import { getAllResourcesByTopic, create } from '../../controllers/learning/topic.controller';
import { apiNotReady } from '../../controllers/api.controller';

const router = Express.Router();

/**
 * @api {get} /learning/content/topics Get all Content Topics
 * @apiDescription get all Content Topics
 * @apiHeader {String} authorization JWT Token.
 * @apiName GetContentTopics
 * @apiGroup ContentTopics
 */
router.get('/', apiNotReady);

/**
 * @api {get} /learning/content/topics/:id Get a Content Topic
 * @apiDescription get a Content Topic
 * @apiHeader {String} authorization JWT Token.
 * @apiName GetContentTopic
 * @apiGroup ContentTopic
 */
router.get('/:id', apiNotReady);

/**
 * @api {get} /learning/content/topics/:id/resources Get Content Topic Resources
 * @apiDescription get Content Topic Resoureces
 * @apiHeader {String} authorization JWT Token.
 * @apiName GetContentTopicResources
 * @apiGroup ContentTopicResources
 */
router.get('/:id/resources', getAllResourcesByTopic);

/**
 * @api {post} /learning/content/topics Add Content Topic
 * @apiDescription Add a Content Topic
 * @apiHeader {String} authorization JWT Token.
 * @apiName AddContentTopic
 * @apiGroup ContentTopic

 * @apiParam {String} title Title of the topic
 * @apiParam {String} description Description of the topic
 * @apiParam {String} milestone_id UUID of the Milestone
 */
router.post('/', create);

/**
 * @api {patch} /learning/content/topics/:id  Update Content Topic
 * @apiDescription Update a Content Topic
 * @apiHeader {String} authorization JWT Token.
 * @apiName UpdateContentTopic
 * @apiGroup ContentTopic
 */
router.patch('/:id', apiNotReady);

/**
 * @api {delete} /learning/content/topics/:id Delete Content Topic
 * @apiDescription Delete a Content Topic
 * @apiHeader {String} authorization JWT Token.
 * @apiName DeleteContentTopic
 * @apiGroup ContentTopic
 */
router.delete('/:id', apiNotReady);

export default router;
