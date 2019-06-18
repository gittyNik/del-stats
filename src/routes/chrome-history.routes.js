var Express=require('express')
var controller=require('../controllers/chrome-history.controller')
const router=Express.Router()
const ip=require('ip')
router.post('/insert',controller.insert);

/**
 * @api {get} /cohorts Get all cohorts
 * @apiHeader {String} authorization JWT Token.
 * @apiName GetCohorts
 * @apiGroup Cohort
 */

router.get('/allresults', controller.getAll);

/**
 * @api {get} /cohorts Get all cohorts
 * @apiHeader {String} authorization JWT Token.
 * @apiName GetCohorts
 * @apiGroup Cohort
 */
 
export default router;
