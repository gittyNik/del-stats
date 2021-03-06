import Express from 'express';
import { insertHistory, getAllDataByUserId, getAllDataByUrlId } from '../../controllers/firewall/browser_history.controller';
import { allowSuperAdminOnly } from '../../controllers/auth/roles.controller';

const router = Express.Router();

// Disable until tested
router.use(allowSuperAdminOnly);

/**
 * @api {post} /browser_history Insert the browser history
 * @apiHeader {String} authorization JWT Token.
 * @apiName InsertBrowserHistory
 * @apiGroup BrowserHistory
 *
 * @apiParam {String} id browser id
 * @apiParam {String} url url
 * @apiParam {String} title title
 * @apiParam {String} useragent useragent
 * @apiSuccess {Object[]} visit each and every url visits
 */
router.post('/', insertHistory);

/**
 * @api {get} /browser_history/user/:user_id Get all the browser history and visits by userid
 * @apiHeader {String} authorization JWT Token.
 * @apiName GetBrowserHistoryByUserId
 * @apiGroup BrowserHistory
 */
router.get('/user/:user_id', getAllDataByUserId);

/**
 * @api {get} /browser_history/url/:url_id Get all the browser history and visits by browser_url_id
 * @apiHeader {String} authorization JWT Token.
 * @apiName GetBrowserHistoryByUrlId
 * @apiGroup BrowserHistory
 */
router.get('/url/:url_id', getAllDataByUrlId);

export default router;
