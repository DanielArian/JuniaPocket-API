var express = require('express');
var router = express.Router();

const middlewares = require('../Middlewares/index');
const planningCtrl = require('../Controllers/planningCtrl');

router.use('/get-week', middlewares.requireWeekDate, planningCtrl.getPlanningOfWeek)

module.exports = router;