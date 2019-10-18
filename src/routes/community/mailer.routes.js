const router = require('express').Router();

const { mailer, submit } = require('../../controllers/mailer.controller');

router.get('/', mailer);
router.post('/submit', submit);

module.exports = router;
