var express = require('express');
var router = express.Router();

const mw = require('../Middlewares/index');
const db = require('../Database/index');
const mongoose = require('mongoose');

router.get('/get', async function (req, res) {
    res.set('Content-Type', 'application/json');
    const newsList = await db.Models.News.find().exec();
    res.status(200).send(newsList);
})


router.get('/auth-check', async function (req, res) {
    res.set('Content-Type', 'application/json');
    const authlist = await db.Models.AuthNews.find().exec();
    let aurionID = req.user.aurionID;
    const output = authlist[0].list.includes(aurionID)
    res.status(200).send(output);
})


router.post('/send', async function (req, res) {
    res.set('Content-Type', 'application/json');
    let aurionID = req.user.aurionID;
    let userDoc = await db.Models.User.findOne({aurionID: aurionID});
    let name = userDoc.name;
    const doc = new db.Models.News({
        _id: new mongoose.Types.ObjectId(),
        auteur: name,
        titre: req.body.titre,
        texte: req.body.texte,
        date: new Date(),
        dest: req.body.dest
    },
        { collection: 'news' });
    doc.save(function (err, doc) {
        if (err) return console.error(err);
    });
    res.status(200).send("Ajout Ã  la bdd ok");
});

module.exports = router;