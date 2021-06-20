var express = require('express');
var router = express.Router();

const widgetCtrl = require('../Controllers/widgetCtrl')

router.get('/get-user-widget', widgetCtrl.getWidget);
router.post('/set-widget-size', widgetCtrl.setPreferenceSizeWidget);

module.exports = router;