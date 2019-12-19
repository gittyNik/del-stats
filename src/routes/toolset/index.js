import Express from 'express';
import noteRouter from './note.routes';
import todoRouter from './todo.routes';
import { allowSuperAdminOnly } from '../../controllers/auth/roles.controller';

const router = Express.Router();

// Disable until tested
router.use(allowSuperAdminOnly);

router.use('/notes', noteRouter);
router.use('/todos', todoRouter);

export default router;
