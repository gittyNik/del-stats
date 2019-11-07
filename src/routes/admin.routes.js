import Express from 'express';
import { switchUser, switchUserByEmail, switchToFakeUser, getConfig, addConfig,
  updateConfig } from '../controllers/admin.controller';
import { allowSuperAdminOnly } from '../controllers/auth/roles.controller';

const router = Express.Router();

router.use(allowSuperAdminOnly);
/**
 * @api {get} /admin/config_params Get configuration
 * @apiDescription Get a list of all configuration parameters
 * @apiHeader {String} authorization JWT Token of superadmin
 * @apiName GetAdminConfiguration
 * @apiGroup Admin
 */
router.get('/config_params', getConfig);
/**
 * @api {post} /admin/config_params Add configuration
 * @apiDescription Add an admin configuration parameter
 * @apiHeader {String} authorization JWT Token of superadmin
 * @apiName AddAdminConfiguration
 * @apiGroup Admin
 */
router.post('/config_params', addConfig);
/**
 * @api {patch} /admin/config_params Change configuration
 * @apiDescription Change an admin configuration parameter
 * @apiHeader {String} authorization JWT Token of superadmin
 * @apiName UpdateAdminConfiguration
 * @apiGroup Admin
 */
router.patch('/config_params', updateConfig);
/**
 * @api {get} /admin/switch_user/fake Switch to a fake user
 * @apiDescription Gain access to a fake user's data by generating an access token
 * @apiHeader {String} authorization JWT Token of superadmin
 * @apiName SwitchFakeUser
 * @apiGroup Admin
 */
router.get('/switch_user/fake', switchToFakeUser);
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
 * @apiParam {String} email Email id of the user
 */
router.get('/switch_user', switchUserByEmail);

router.use('*', (req, res) => res.sendStatus(404));
export default router;
