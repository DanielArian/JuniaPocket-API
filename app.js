var express = require('express');
var cors = require('cors');

const config = require('./Config/index');
const routes = require('./Routes/index');
const mw = require('./Middlewares/index');
const axios = require('axios');

const dbUsername = process.env.DB_USERNAME || config.dbUsername;
const dbPassword = process.env.DB_PASSWORD || config.dbPassword;
const port = process.env.PORT || 5000;

// Connection à Mongo DataBase
const dbConnection = require('./databaseConnection');
const URI = `mongodb+srv://${dbUsername}:${dbPassword}@juniapocket.1vwtr.mongodb.net/data?retryWrites=true&w=majority`
dbConnection.connectToMongoDB(URI);


// Check des notes automatique pour p64002
// Expérimental
setInterval(async function () {

    var dataToSend = {
        "aurionID": 'p64002',
        "jpocketPassword": 'daniel'
    };

    let r = await axios.post(`http://localhost:${port}/user/login`, dataToSend)
        .then(function (response) {
            // Affiche la réponse
            // console.log(response.data);
            return response;
        })
        .catch(function (error) {
            console.log(error);
        })
    let token;
    if (r.status == 200) {
        token = r.data.token;
    }
    // console.log('token :' , token);

    const config = {
        headers: { Authorization: `Bearer ${token}` }
    };

    let r2 = await axios.post(`http://localhost:${port}/marks/update`, { isAutomaticUpdate: '' }, config)
        .then(function (response) {
            // Affiche la réponse
            // console.log(response.data);
            return response;
        })
        .catch(function (error) {
            console.log(error);
        })

}, 10 * 60 * 1000);


// Launch and config server
var app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Set CORS
var allowedDomains = [
    'https://juniapocket.vercel.app',
    'juchnia-pierre2.vercel.app',
    'http://localhost:3000'
];
app.use(cors({
    origin: function (origin, callback) {
        // bypass the requests with no origin (like curl requests, mobile apps, etc )
        if (!origin) return callback(null, true);

        if (allowedDomains.indexOf(origin) === -1) {
            var msg = `This site ${origin} does not have an access. Only specific domains are allowed to access it.`;
            return callback(new Error(msg), false);
        }
        return callback(null, true);
    }
}));


app.use(mw.logRequest);
app.use('/', routes.homepage);
app.get('/isTokenValid', mw.auth);
app.use('/user', routes.user);

// L'accès aux chemins ci-dessous nécessite une authentification
app.use(mw.auth);
app.use('/marks', routes.marks);
app.use('/planning', routes.planning);

app.listen(port, function () {
    console.log(`Listening on Port ${port}`);
});