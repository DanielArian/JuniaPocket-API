var express = require('express');

const routes = require('./Routes/index');
const middlewares = require('./Middlewares/index');

// Connection to Mongo DataBase
const dbConnection = require('./databaseConnection');
const dbURL = "mongodb+srv://daniel:daniel59@widget.1vwtr.mongodb.net/data?retryWrites=true&w=majority";
dbConnection.connectToMongoDB(dbURL);

// Launch server
var app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(middlewares.logRequest);

app.use('/', routes.homepage);

// ajouter un middleware ici pour verifier que l'utilisateur est connecté
// pour pouvoir acceder aux requetes ci-dessous

app.use('/marks', routes.marks);
app.use('/planning', routes.planning);
app.use('/user', routes.user);

app.listen(process.env.PORT || 5000, function() {
    console.log(`Listening on Port 5000`);
});