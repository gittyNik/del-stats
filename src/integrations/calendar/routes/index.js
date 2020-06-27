import express from 'express';
import calendarRouters from './calendar.routes';
import adminRouters from './admin_dashboard.routes';
import { allowMultipleRoles } from '../../../controllers/auth/roles.controller';
import { USER_ROLES } from '../../../models/user';


const {
  ADMIN, SUPERADMIN, EDUCATOR,
} = USER_ROLES;

const router = express.Router();

router.use('/learner', calendarRouters);

router.use(allowMultipleRoles([ADMIN, SUPERADMIN, EDUCATOR]));

router.use('/admin', adminRouters);


export default router;
