import Express from 'express';
import { createSandbox } from '../../../integrations/codesandbox/codesandbox.controller';

const router = Express.Router();

router.use(Express.urlencoded({ limit: '20mb', extended: false }));
router.get('/create', createSandbox);

export default router;
