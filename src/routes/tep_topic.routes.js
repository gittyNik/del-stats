import Express from 'express';
import {getAllByTopic as getTopicResources } from '../controllers/tep_resource.controller';

const router = Express.Router();

/**
 * @api {get} /tep/topics/:topic_id/resources Get TEP resources of a topic
 * @apiHeader {String} authorization JWT Token.
 * @apiName GetTopicResources
 * @apiGroup TepResources
 */
router.get('/:topic_id/resources', getTopicResources);

export default router;
