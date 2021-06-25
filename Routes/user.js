var express = require('express');
var router = express.Router();

const mw = require('../Middlewares/index');
const userCtrl = require('../Controllers/userCtrl');

router.post('/signup', mw.requireSignupParam, mw.requireUserNotAlreadyRegistered, userCtrl.signup);
router.post('/login', mw.requireLoginParam, userCtrl.login);

router.use(mw.auth);
router.get('/list', userCtrl.getList);
router.post('/delete', userCtrl.delete);
router.post('/change-jpocket-password', userCtrl.changeJpocketPassword);
router.post('/change-aurion-login-credentials', mw.requireAurionLoginCred, userCtrl.changeAurionLoginCred);
router.post('/preferences/notifications', mw.requireNotifPrefParam, userCtrl.setNotificationsPreferences);

module.exports = router;