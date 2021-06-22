var express = require('express');
var router = express.Router();

const roomCtrl = require('../Controllers/roomCtrl');
const mw = require('../Middlewares/index');

router.post('/get-available', mw.requireAvailableRoomReqParam, roomCtrl.getAvailableRoomsByUserPreferences);
router.post('/send-favorite-to-database', roomCtrl.sendUserFavoritesToDatabase);
router.get('/get-favorite', roomCtrl.getUserFavoriteRoom);

module.exports = router;