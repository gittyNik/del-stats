import Express from 'express';
import authenticate from '../../../controllers/auth/auth.controller';
import calendarRouters from './calendar.routes';
import adminRouters from './admin_dashboard.routes';
import { allowMultipleRoles } from '../../../controllers/auth/roles.controller';
import { USER_ROLES } from '../../../models/user';

const {
  ADMIN, EDUCATOR,
} = USER_ROLES;

const router = Express.Router();

router.use(authenticate);

router.use('/learner', calendarRouters);

router.use(allowMultipleRoles([ADMIN, EDUCATOR]));

router.use('/admin', adminRouters);

export default router;
