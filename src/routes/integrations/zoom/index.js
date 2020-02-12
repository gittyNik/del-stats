import Express from 'express';
import meetingsApi from '../../../integrations/zoom/meetings.controller';

const router = Express.Router();

router.use(Express.urlencoded({ limit: '20mb', extended: false }));
router.post('/meeting', meetingsApi);

export default router;
