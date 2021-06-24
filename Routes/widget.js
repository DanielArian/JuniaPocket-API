var express = require('express');
var router = express.Router();
var Parser = require('rss-parser');

const widgetCtrl = require('../Controllers/widgetCtrl')

router.post('/get-user-widget', widgetCtrl.getWidget);
router.post('/set-widget-size', widgetCtrl.setPreferenceSizeWidget);
router.post('/set-widget-isThere', widgetCtrl.setPreferenceIsThereWidget);
router.post('/set-widget-habits', widgetCtrl.setHabitsWidget);
router.get('/get-hidden-widgets', widgetCtrl.getHiddenWidgets);

router.get('/news', async function (req, res) {
    res.set('Content-Type', 'application/json');
    let parser = new Parser();
    const url = ["https://www.developpez.com/index/rss"];
    var random = url[Math.floor(Math.random() * url.length)];
    let feed = await parser.parseURL(random);
    const entry = feed.items[Math.floor(Math.random() * feed.items.length)];
    const output = [feed.title, entry];
    res.status(200).send(output);
});

module.exports = router;