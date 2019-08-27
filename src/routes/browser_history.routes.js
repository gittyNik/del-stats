var Express=require('express')
var controller=require('../controllers/browser-history.controller')
const router=Express.Router()

/**
 * @api {get} /browser-history/insert Get all the browser history and visits by userid 
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

router.post('/insert',controller.insert);

/**
 * @api {get} /browser-history/historyurl/userid/:u_id Get all the browser history and visits by userid 
 * @apiHeader {String} authorization JWT Token.
 * @apiName GetBrowserHistoryByUserId
 * @apiGroup BrowserHistory
 */
router.get('/historyurl/userid/:u_id',controller.getAllDataByUserId);

/**
 * @api {get} /browser-history/historyurl/:id Get all the browser history and visits by browser_url_id 
 * @apiHeader {String} authorization JWT Token.
 * @apiName GetBrowserHistoryByUrlId
 * @apiGroup BrowserHistory
 */
router.get('/historyurl/:id', controller.getAllDataByUrlId); 
export default router;
