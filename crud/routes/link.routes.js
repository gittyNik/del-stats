var Express = require('express');

var X = require('../controllers/link.controller');
const router = Express.Router();

router.post('/insert/:id', X.insert);
router.get('/:name', X.select);

module.exports = { "router": router };