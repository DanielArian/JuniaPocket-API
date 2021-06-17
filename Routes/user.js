var express = require('express');
var router = express.Router();

const mw = require('../Middlewares/index');
const userCtrl = require('../Controllers/userCtrl');
const groupCtrl = require('../Controllers/groupCtrl');

// MIDDLEWARE PENSER A REQUIRE LES PARAM POUR SIGN UP ET LOGIN

router.post('/signup', mw.requireSignupParam, mw.requireUserNotAlreadyRegistered, userCtrl.signup);
router.post('/login', mw.requireLoginParam, userCtrl.login);

router.use(mw.auth);
router.post('/change-aurion-login-credentials', userCtrl.changeAurionLoginCred);
router.get('/list', userCtrl.getList);
router.post('/create-group', groupCtrl.createGroup);
router.get('/delete', userCtrl.delete);
router.post('/preferences/notifications', mw.requireNotifPrefParam, userCtrl.setNotificationsPreferences);

module.exports = router;