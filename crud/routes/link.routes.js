var Express = require('express');
var X = require('../controllers/link.controller');

const router = Express.Router();

router.get('/', X.getAll);
router.post('/', X.create);
router.get('/:id', X.getOne);

export default router;
