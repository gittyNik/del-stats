const router = require('express').Router();

const { mailer, submit } = require('../../controllers/community/mailer.controller');

router.get('/', mailer);
router.post('/submit', submit);

module.exports = router;
