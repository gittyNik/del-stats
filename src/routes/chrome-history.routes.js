var Express=require('express')
var controller=require('../controllers/chrome-history.controller')
const router=Express.Router()
const ip=require('ip')
router.post('/insert',controller.insert);

router.get('/allresults', controller.getAll);
router.get('/max',controller.getMax);
 
export default router;
