import Express from 'express';
import {
  getAttendanceForCohorts,
  getAttendanceForLearners,
  updateCohortBreakoutStatusAPI,
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

/**
 * @api {post} /operations/attendance Get all attendance
 * @apiDescription get all Attendance with filters
 * @apiHeader {String} authorization JWT Token.
 * @apiName GetAttendance
 * @apiGroup Attendance
 */
router.post('/', getAttendanceForLearners);

/**
 * @api {post} /operations/attendance/status Update Cohort Breakout Status
 * @apiDescription update attendance for learners and change status
 * @apiHeader {String} authorization JWT Token.
 * @apiName UpdateAttendance
 * @apiGroup Attendance
 */
router.post('/status', updateCohortBreakoutStatusAPI);

export default router;
