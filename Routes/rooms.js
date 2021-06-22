var express = require('express');
var router = express.Router();

const roomCtrl = require('../Controllers/roomCtrl');
const mw = require('../Middlewares/index');

router.post('/available-rooms', mw.requireAvailableRoomReqParam, roomCtrl.getAvailableRoomsByUserPreferences)

router.post('/send-favorite', roomCtrl.getUserFavoriteRooms);

module.exports = router;