var express = require('express');
var router = express.Router();

const middlewares = require('../Middlewares/index');

router.use(middlewares.requireBodyParam)

router.post('/get-marks', async (req, res) => {

    console.log('IN post');
    
});

module.exports = router;