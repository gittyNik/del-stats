import Express from 'express';
import afterCapstoneRouter from './ops_mockinterview_aftercapstone.routes';

const router = Express.Router();

router.use('/aftercapstone', afterCapstoneRouter);

export default router;
