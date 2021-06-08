var express = require('express');
var cors = require('cors');

const config = require('./Config/index');
const routes = require('./Routes/index');
const mw = require('./Middlewares/index');

const dbUsername =  process.env.DB_USERNAME || config.dbUsername;
const dbPassword =  process.env.DB_PASSWORD || config.dbPassword;
const port = process.env.PORT || 5000 ;

// Connection à Mongo DataBase
const dbConnection = require('./databaseConnection');
const URI = `mongodb+srv://${dbUsername}:${dbPassword}@juniapocket.1vwtr.mongodb.net/data?retryWrites=true&w=majority`
dbConnection.connectToMongoDB(URI);

// Launch and config server
var app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors({origin: 'http://localhost:3000'}));

app.use(mw.logRequest);

app.use('/', routes.homepage);
app.use('/user', routes.user);

// L'accès aux chemins ci-dessous nécessite une authentification
app.use(mw.auth);
app.use('/marks', routes.marks);
app.use('/planning', routes.planning);


app.listen(port , function() {
    console.log(`Listening on Port ${port}`);
});