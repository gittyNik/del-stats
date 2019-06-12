import Express from 'express';
import {getAllByTopic as getTopicResources } from '../controllers/tep_resource.controller';

const router = Express.Router();

router.get('/:topic_id/resources', getTopicResources);

export default router;
