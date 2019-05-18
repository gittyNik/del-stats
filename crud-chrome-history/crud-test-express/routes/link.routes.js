var Express=require('express')
var X=require('../controllers/link.controller')

const router=Express.Router()
console.log(X.insert)
router.get('/:id', X.getOne);
router.get('/', X.getAll);
router.post('/insert/:id', X.insert);

module.exports={"router":router};
