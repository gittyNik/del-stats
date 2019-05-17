var Express = require('express');
var X = require('../controllers/link.controller');
const router = Express.Router();

router.post('/', X.insert);
router.get('/:name', X.select);