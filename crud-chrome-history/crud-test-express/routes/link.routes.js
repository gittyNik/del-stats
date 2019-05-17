var Express=require('express')
var X=require('../controllers/link.controller')
const router=Express.Router()

router.get('/:id', X.select);
router.post('/', X.insert);

export default router;
