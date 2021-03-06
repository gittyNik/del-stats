import Express from 'express';
import {
  getAll, getOne, create, update, deleteOne, updateAll, deleteMultiple,
} from '../../controllers/toolset/todo.controller';

const router = Express.Router();

router.get('/', getAll);
router.post('/', create);
router.get('/:id', getOne);
router.patch('/:id', update);
router.patch('/', updateAll);
router.delete('/:id', deleteOne);
router.delete('/', deleteMultiple);

export default router;
