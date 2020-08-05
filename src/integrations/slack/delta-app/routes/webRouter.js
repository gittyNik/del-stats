import Express from 'express';
import { sendMessage, notifyLearnerInChannel } from '../controllers/web.controller';

const router = Express.Router();

router.post('/send-message', sendMessage);
router.post('/notify-learner', notifyLearnerInChannel);

export default router;
