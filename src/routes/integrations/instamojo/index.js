import Express from 'express';
import instamojo_webhook from '../../../integrations/instamojo/instamojo.controller';

const router = Express.Router();

router.use('/webhook', instamojo_webhook);

export default router;
