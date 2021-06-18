var express = require('express');
var router = express.Router();

const mw = require('../Middlewares/index');
const marksCtrl = require('../Controllers/marksCtrl')

router.post('/get', mw.isCurrentlyGettingMarkFTFT, marksCtrl.getMarks);
router.post('/update', mw.requireExistingMarkDoc, marksCtrl.updateMarks);

module.exports = router;