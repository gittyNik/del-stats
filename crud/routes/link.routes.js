var Express = require('express');

var X = require('../controllers/link.controller');
const router = Express.Router();

router.post('/insert/:uid/:topic/:url', X.insert);
router.get('/:topic', X.select);

module.exports = { "router": router };