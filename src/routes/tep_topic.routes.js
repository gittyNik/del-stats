import Express from 'express';
import {get_topic_resources} from '../controllers/link.controller';

const router = Express.Router();

router.get('/:topic_id/resources',get_topic_resources);

export default router;