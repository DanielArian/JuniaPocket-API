var express = require('express');
var router = express.Router();

const middlewares = require('../Middlewares/index');
const userCtrl = require('../Controllers/userCtrl');

// MIDDLEWARE PENSER A REQUIRE LES PARAM POUR SIGN UP ET LOGIN

router.post('/signup', middlewares.requireSignupParam, userCtrl.signup);
router.post('/login', middlewares.requireLoginParam, userCtrl.login);

module.exports = router;