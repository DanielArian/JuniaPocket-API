var express = require('express');
var router = express.Router();

const groupCtrl = require('../Controllers/groupCtrl');
const mw = require('../Middlewares/index');

router.get('/get', groupCtrl.getUserGroups);

// AJOUTER ICI UN MIDDLEWARE POUR VERIF QUE LE GROUP ID EST BIEN FOURNI, sinon BAD REQUEST

router.post('/create', groupCtrl.createGroup);
router.post('/join', groupCtrl.joinGroup);
router.post('/leave', groupCtrl.leaveGroup);

module.exports = router;