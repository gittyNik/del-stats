import express from 'express';
import {
  updateUser,
  getEducators,
} from '../../controllers/community/user.controller';
import { allowMultipleRoles } from '../../controllers/auth/roles.controller';
import { USER_ROLES } from '../../models/user';

const {
  ADMIN, CATALYST, EDUCATOR, REVIEWER,
} = USER_ROLES;

const router = express.Router();

router.patch('/', updateUser);

router.use(allowMultipleRoles([ADMIN, CATALYST, EDUCATOR, REVIEWER]));

router.get('/educators', getEducators);

module.exports = router;
