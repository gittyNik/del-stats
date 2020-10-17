import Express from 'express';
import attendance from './attendance.routes';
import catalyst from './catalyst.routes';
import learners from './learners.routes';

const router = Express.Router();

router.use('/attendance', attendance);
router.use('/catalyst', catalyst);
router.use('/learner', learners);

export default router;
