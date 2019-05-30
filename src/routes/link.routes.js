import Express from 'express';
import {insert,select} from '../controllers/link.controller';

const router = Express.Router();

router.post('/:uid/:topic/:url', insert);
router.get('/:topic', select);

export default router;