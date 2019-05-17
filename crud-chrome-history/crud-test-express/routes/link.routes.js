var Express=require('express')
var X=require('../controllers/link.controller')

const router=Express.Router()
console.log(X.insert)
router.get('/:id', X.select);
router.post('/', X.insert);

module.export=router;
