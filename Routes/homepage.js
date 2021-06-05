var express = require('express');
var router = express.Router();

router.get('/', async (req, res) => {
    console.log(req.method);
    console.log(req.c);
    res.end('JuniaPocket API - Projet en cours de développement !');
});

module.exports = router;