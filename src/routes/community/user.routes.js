import express from 'express';
import {
  updateUser,
  getEducators,
  updateUserStatus,
} from '../../controllers/community/user.controller';
import { allowMultipleRoles } from '../../controllers/auth/roles.controller';
import { USER_ROLES } from '../../models/user';

const {
  ADMIN, CATALYST, EDUCATOR, REVIEWER,
} = USER_ROLES;

const router = express.Router();

router.use(allowMultipleRoles([ADMIN, CATALYST, EDUCATOR, REVIEWER]));

router.post('/', updateUserStatus);

router.get('/educators', getEducators);

router.use(allowMultipleRoles([ADMIN]));

router.patch('/', updateUser);

module.exports = router;
