import Express from 'express';
import {getAllByTopic as getTopicResources } from '../controllers/tep_topic.controller';
import {create} from '../controllers/tep_topic.controller';

const router = Express.Router();

/**
 * @api {get} /tep/topics/:topic_id/resources Get TEP resources of a topic
 * @apiHeader {String} authorization JWT Token.
 * @apiName GetTopicResources
 * @apiGroup TepResources
 */
router.get('/:topic_id/resources', getTopicResources);

/**
 * @api {post} /tep/topics Add a TEP Topic
 * @apiHeader {String} authorization JWT Token.
 * @apiName AddNewTopic
 * @apiGroup TepTopics
 *
 * @apiParam {String} title Title of the topic
 * @apiParam {String} description Description of the topic
 */
router.post('/', create);

export default router;
