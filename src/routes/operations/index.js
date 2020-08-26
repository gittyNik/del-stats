import Express from 'express';
import attendance from './attendance.routes';

const router = Express.Router();

router.use('/attendance', attendance);

export default router;
