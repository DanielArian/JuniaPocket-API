var express = require('express');
var router = express.Router();

const widgetCtrl = require('../Controllers/widgetCtrl')

router.get('/get-user-widget', widgetCtrl.getWidget);
router.post('/set-widget-size', widgetCtrl.setPreferenceSizeWidget);
router.post('/set-widget-isThere', widgetCtrl.setPreferenceIsThereWidget);
router.post('/set-widget-habits', widgetCtrl.setHabitsWidget);
router.get('/get-hidden-widgets', widgetCtrl.getHiddenWidgets);

module.exports = router;