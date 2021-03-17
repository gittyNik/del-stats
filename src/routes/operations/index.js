import Express from 'express';
import attendance from './attendance.routes';
import catalyst from './catalyst.routes';
import learners from './learners.routes';
import payments from './payment.routes';

const router = Express.Router();

router.use('/attendance', attendance);
router.use('/catalyst', catalyst);
router.use('/learner', learners);
router.use('/payment', payments);

export default router;
