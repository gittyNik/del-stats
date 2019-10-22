import Express from 'express';
import noteRouter from './note.routes';
import todoRouter from './todo.routes';

const router = Express.Router();

router.use('/notes', noteRouter);
router.use('/todos', todoRouter);

export default router;
