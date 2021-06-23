var express = require('express');
var router = express.Router();

const mw = require('../Middlewares/index');
const planningCtrl = require('../Controllers/planningCtrl');

router.use('/get-week', mw.requireWeekDate, mw.isCurrentlyGettingPlanningfFTFT, planningCtrl.getPlanningOfWeek);
router.use('/update', mw.requireWeekDate, planningCtrl.updateWeek);
router.use('/get-common-availability', planningCtrl.getCommonAvailableTimeSlots);

module.exports = router;