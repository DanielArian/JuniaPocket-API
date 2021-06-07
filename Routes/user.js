var express = require('express');
var router = express.Router();

const userCtrl = require('../Controllers/userCtrl');

// MIDDLEWARE PENSER A REQUIRE LES PARAM POUR SIGN UP ET LOGIN

router.post('/signup', userCtrl.signup);
router.post('/login', userCtrl.login);

module.exports = router;