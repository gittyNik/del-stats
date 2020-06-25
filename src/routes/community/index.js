import Express from 'express';
import socialConnectionRouter from './social_connection.routes';
import usersRouter from './user.routes';
import { allowSuperAdminOnly } from '../../controllers/auth/roles.controller';

const router = Express.Router();

router.use('/users', usersRouter);

router.use('/social_connections', socialConnectionRouter);

// Disable until tested
router.use(allowSuperAdminOnly);

router.use('/soal_events', socialConnectionRouter);

export default router;
