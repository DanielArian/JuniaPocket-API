var express = require('express');
var cors = require('cors');

const config = require('./Config/index');
const routes = require('./Routes/index');
const mw = require('./Middlewares/index');
const automaticActions = require('./automaticActions');

const isTokenValidCtrl = require('./Controllers/isTokenValid');

const dbUsername = process.env.DB_USERNAME || config.dbUsername;
const dbPassword = process.env.DB_PASSWORD || config.dbPassword;
const port = process.env.PORT || 5000;

// Connection à Mongo DataBase
const dbConnection = require('./databaseConnection');
const URI = `mongodb+srv://${dbUsername}:${dbPassword}@juniapocket.1vwtr.mongodb.net/data?retryWrites=true&w=majority`
dbConnection.connectToMongoDB(URI);


// Actions automatiques
setInterval(automaticActions.keepHerokuAlive, 30 * 60 * 1000);
setInterval(automaticActions.updateMarks , 15 * 60 * 1000);
setInterval(automaticActions.notifyNextCourse , 15 * 60 * 1000);


// (async () => {
//     await automaticActions.updateUnavailableRooms()
// })()


// Launch and config server
var app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// local variables, pour limiter certaines demandes simultannées
app.locals.listOfUsersCurrentlyGettingPlanningForFirstTime = [];
app.locals.listOfUsersCurrentlyGettingMarkForFirstTime = [];

// Set CORS
var allowedDomains = [
    'https://juniapocket.vercel.app',
    'https://juchnia-pierre2.vercel.app',
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
app.get('/isTokenValid', isTokenValidCtrl);
app.use('/user', routes.user);

// L'accès aux chemins ci-dessous nécessite une authentification
app.use(mw.auth);
app.use('/marks', routes.marks);
app.use('/planning', routes.planning);

app.listen(port, function () {
    console.log(`Listening on Port ${port}`);
});