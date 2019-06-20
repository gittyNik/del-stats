var Express=require('express')
var controller=require('../controllers/chrome-history.controller')
const router=Express.Router()

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
