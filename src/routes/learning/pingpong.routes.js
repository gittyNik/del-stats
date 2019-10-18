import Express from 'express';
import addPong from '../../controllers/pingpong.controller';

const router = Express.Router();

router.post('/:pingpong_id/pongs', addPong);

export default router;
