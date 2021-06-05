var express = require('express');
var router = express.Router();

const userCtrl = require('../Controllers/userCtrl');

router.post('/signup', userCtrl.signup);
router.post('/login', userCtrl.login);

module.exports = router;