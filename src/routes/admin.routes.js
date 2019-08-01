import Express from 'express';
import {switchUser, switchUserByEmail} from '../controllers/admin.controller';
import {allowSuperAdminOnly} from '../controllers/roles.controller';

const router = Express.Router();

router.use(allowSuperAdminOnly);
/**
 * @api {get} /admin/switch_user/:user_id Switch User
 * @apiDescription Gain access to another user's data by generating an access token
 * @apiHeader {String} authorization JWT Token of superadmin
 * @apiName SwitchUser
 * @apiGroup Admin
 */
router.get('/switch_user/:user_id', switchUser);
/**
 * @api {get} /admin/switch_user Switch User By Email
 * @apiDescription Use email to gain access to another user's data by generating an access token
 * @apiHeader {String} authorization JWT Token of superadmin
 * @apiName SwitchUserByEmail
 * @apiGroup Admin
 *
 * @apiParam email Email id of the user
 */
router.get('/switch_user', switchUserByEmail);

router.use('*', (req, res) => res.sendStatus(404));
export default router;