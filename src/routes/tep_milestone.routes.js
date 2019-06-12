import Express from 'express';
import {get_milestone_resources} from '../controllers/link.controller';

const router = Express.Router();

router.get('/:milestone_id/resources',get_milestone_resources);

export default router;