import Express from 'express';
import searchRouter from './search.routes.js';
// import authenticate from '../../../controllers/auth/auth.controller';

const router = Express.Router();

// router.use(authenticate);

router.use('/search', searchRouter);

export default router;