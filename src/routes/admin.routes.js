import Express from 'express';
import switchUser from '../controllers/admin.controller';
import {allowSuperAdminOnly} from '../controllers/roles.controller';

const router = Express.Router();

router.use(allowSuperAdminOnly);
router.use('/switch_user/:user_id', switchUser);

router.use('*', (req, res) => res.sendStatus(404));
export default router;