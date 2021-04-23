import express from 'express';
import {
  updateUser,
  getEducators,
  updateUserStatus,
  leastAttendanceInCohort,
  removeUserStatusApi,
  getUsersByRole,
  getUserByEmailAPI,
} from '../../controllers/community/user.controller';
import { allowMultipleRoles, allowAdminsOnly } from '../../controllers/auth/roles.controller';
import { USER_ROLES } from '../../models/user';

const {
  ADMIN, EDUCATOR, REVIEWER,
} = USER_ROLES;

const router = express.Router();

router.use(allowMultipleRoles([ADMIN, EDUCATOR, REVIEWER]));

router.post('/', updateUserStatus);

router.post('/remove-status', removeUserStatusApi);

router.post('/least-attendance', leastAttendanceInCohort);

router.get('/educators', getEducators);

router.get('/role/:role', getUsersByRole);

router.get('/email/:email', getUserByEmailAPI);

router.use(allowAdminsOnly);

router.patch('/', updateUser);

module.exports = router;
