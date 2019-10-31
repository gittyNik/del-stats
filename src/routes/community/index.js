import Express from 'express';
import socialConnectionRouter from './social_connection.routes';

const router = Express.Router();

// Private routes
router.use('/social_connections', socialConnectionRouter);
router.use('/soal_events', socialConnectionRouter);

export default router;
