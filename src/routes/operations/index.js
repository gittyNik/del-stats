import Express from 'express';
import attendance from './attendance.routes';
import catalyst from './catalyst.routes';

const router = Express.Router();

router.use('/attendance', attendance);
router.use('/catalyst', catalyst);

export default router;
