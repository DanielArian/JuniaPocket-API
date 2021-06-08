var express = require('express');
var router = express.Router();

const middlewares = require('../Middlewares/index');
const marksCtrl = require('../Controllers/marksCtrl')

router.use((req, res, next) => {
    console.log("Inside PERSO middleware in /marks");
    next();
  });

router.post('/get', marksCtrl.getMarks);

router.use(middlewares.requireExistingMarkDoc);
router.post('/update', marksCtrl.updateMarks);

module.exports = router;