const mongoose = require('mongoose');
const express = require('express');
const { urlencoded } = require('body-parser');

const fetch = require('./AurionScrapperCore/fetch.js');
const formatMarks = require('./AurionScrapperCore/formatMarks.js');
const formatPlanning = require('./AurionScrapperCore/formatPlanning.js');
const mongo = require('./HandleDB/mongo');

// Config du server Express

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));


// Connexion à la base de données MongoDB

const uri = "mongodb+srv://daniel:daniel59@widget.1vwtr.mongodb.net/data?retryWrites=true&w=majority";
mongoose.connect(uri, {useNewUrlParser: true, useUnifiedTopology: true});
db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
    console.log("connecté à Mongoose");
    // Find a Model in database
});


// Ecoute des requetes

app.get('/', async (req, res) => {

    var r = 'AurionScrapper - Projet en cours de développement.'
    res.end(r)
})


app.post('/getMarks', async (req, res) => {

    // console.log('body :\n', req.body);
    // const x = await mongo.getStudentMarks(req.body.username)
    // let htmlMarksPage = await fetch.marks(req.body.username, req.body.password);
    // var DataToSend = formatMarks.getFormatedMarks(htmlMarksPage);
    // const y = await mongo.updateMarkDocument(req.body.username, DataToSend);
    // res.end(JSON.stringify(y));
    // // res.end(JSON.stringify([])) 

});


app.post('/notes', async (req, res) => {

    console.log('POST / Notes')
    // console.log(req.body);
    res.set('Content-Type', 'application/json');

    if (req.body.hasOwnProperty('username') == true & req.body.hasOwnProperty('password') == true) {

        console.log("Connexion de " + req.body.username)
        var htmlMarksPage = await fetch.marks(req.body.username, req.body.password);

        if (htmlMarksPage.includes("invalide")) {
            res.end('Login ou mot de passe invalide. Sinon, verifier votre connexion internet ou re-essayer plus tard.');
        }
        else {
            var DataToSend = formatMarks.getFormatedMarks(htmlMarksPage);
            res.end(JSON.stringify(DataToSend));
        }
    }
    else {
        res.end("La requete POST ne contient pas d'arguments username et password")
    }
});


app.post('/planning', async (req, res) => {

    console.log('POST / Planning')
    // console.log(req.body);
    res.set('Content-Type', 'application/json');

    if (req.body.hasOwnProperty('username') == true 
        & req.body.hasOwnProperty('password') == true
        & req.body.hasOwnProperty('planningDate') == true) {

        console.log("Connexion de " + req.body.username)
        // PENSER A VERIF LE FORMAT DES DONNEES AVANT DE LES ENVOYER COMME CA
        var page_content = await fetch.planning(req.body.username, req.body.password, req.body.planningDate);

        if (page_content.includes("invalide")) {
            res.end('Login ou mot de passe invalide. Sinon, verifier votre connexion internet ou re-essayer plus tard.');
        }
        else {
            const Events = formatPlanning.responseWeekPlanning(page_content);
            res.end(JSON.stringify(Events));
        }
    }
    else {
        console.log("Au moins un argument est manquant.")
        res.end("La requete POST ne contient pas un argument nécessaire")
    }
})

app.listen(process.env.PORT || 5000, function() {
    console.log(`Listening on Port 5000`);
  });