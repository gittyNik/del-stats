import Express from 'express';
import {
  getAttendanceForCohorts,
} from '../../controllers/operations/attendance.controller';
import { USER_ROLES } from '../../models/user';
import {
  allowMultipleRoles,
} from '../../controllers/auth/roles.controller';

const {
  ADMIN, SUPERADMIN, OPERATIONS, EDUCATOR,
} = USER_ROLES;

const router = Express.Router();

router.use(allowMultipleRoles([ADMIN, SUPERADMIN, OPERATIONS, EDUCATOR]));

/**
 * @api {get} /operations/attendance Get all attendance
 * @apiDescription get all Attendance
 * @apiHeader {String} authorization JWT Token.
 * @apiName GetAttendance
 * @apiGroup Attendance
 */
router.get('/', getAttendanceForCohorts);

export default router;
