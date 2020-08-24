import Express from 'express';
import { getUserTweetsWrapper } from '../../../integrations/twitter/controllers';
// import authenticate from '../../../controllers/auth/auth.controller';

const router = Express.Router();

// router.use(authenticate);

router.get('/:handle', getUserTweetsWrapper);

export default router;
