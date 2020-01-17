import Express from 'express';
import instamojo_webhook from '../../../integrations/instamojo/instamojo.controller';

const router = Express.Router();

router.use(Express.urlencoded({ limit: '20mb', extended: false }));
router.post('/webhook', instamojo_webhook);

export default router;
