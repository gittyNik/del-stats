import Express from 'express';
import { getAll, getOne, create, update, deleteOne } from '../controllers/educator.controller';

const router = Express.Router();

router.get('/', getAll);
router.post('/', create);
router.get('/:id', getOne);
router.patch('/:id', update);
router.delete('/:id', deleteOne);

export default router;
