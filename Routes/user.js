var express = require('express');
var router = express.Router();

const mw = require('../Middlewares/index');
const userCtrl = require('../Controllers/userCtrl');

// MIDDLEWARE PENSER A REQUIRE LES PARAM POUR SIGN UP ET LOGIN

router.post('/signup', mw.requireSignupParam, mw.requireUserNotAlreadyRegistered, userCtrl.signup);
router.post('/login', mw.requireLoginParam, userCtrl.login);

module.exports = router;