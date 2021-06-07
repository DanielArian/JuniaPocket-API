var express = require('express');
var router = express.Router();

const middlewares = require('../Middlewares/index');
const marksCtrl = require('../Controllers/marksCtrl')

router.post('/get', marksCtrl.getMarks);
router.post('/update', marksCtrl.updateMarks)

module.exports = router;